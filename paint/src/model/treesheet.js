import {getValueByPath} from "../general/Utils";

export default class Treesheet {

    constructor(name, types, dataTree) {
        this.name = name;
        this.types = types;
        this.dataTree = dataTree;
        this.sheetsByName = {};
        this.sheetNames = [];
        this.rows = [];
        this.numColumns = 0;
        this.columns = [];

        this.createRows(this.dataTree);
        this.updateSpreadsheetOpenRows();
    }

    createRow(obj, path) {

        let typeName = obj['type'];
        if (!typeName || !this.types.hasOwnProperty(typeName))
            typeName = obj['table'];
        let type = this.types[typeName];
        if (!type)
            return;

        let sheetName = `${typeName}_${path.length}`;

        let values = type.columns.map(column => {
            return getValueByPath(obj, column.path);
        });
        this.numColumns = Math.max(this.numColumns, type.columns.length);
        if (!this.sheetsByName.hasOwnProperty(sheetName)) {
            this.sheetsByName[sheetName] = {
                typeName,
                sheetName,
                path,
                type,
            };
            this.sheetNames.push(sheetName);
        }
        let row = {
            typeName,
            sheetName,
            values,
            path,
        };
        this.rows.push(row);

        if (type.hasOwnProperty('fields')) {
            type.fields.every((key) => {
                this.createRows([obj[key]], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }

        if (type.hasOwnProperty('arrays')) {
            type.arrays.every((key) => {
                this.createRows(obj[key], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }
    }

    createRows(aList, path = []) {
        aList.every((obj, iObj) => {
            this.createRow(obj, [...path, iObj]);
            return obj;
        });
    }


    updateSpreadsheetOpenRows() {
        let openIndent = -1;
        this.openRows = this.rows.filter((row) => {
            let indent = row.path.length;
            if (openIndent !== -1 && indent > openIndent)
                return false;
            if (indent === openIndent)
                openIndent = -1;
            if (!row.isOpen)
                openIndent = indent;
            return true;
        });
    }
}
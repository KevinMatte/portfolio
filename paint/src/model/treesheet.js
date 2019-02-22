import {getValueByPath} from "../general/Utils";

export default class Treesheet {
        static createRow(props, spreadsheet, obj, path) {

        let typeName = obj['type'];
        if (!typeName || !props.types.hasOwnProperty(typeName))
            typeName = obj['table'];
        let type = props.types[typeName];
        if (!type)
            return;

        let sheetName = `${typeName}_${path.length}`;

        let values = type.columns.map(column => {
            return getValueByPath(obj, column.path);
        });
        spreadsheet.numColumns = Math.max(spreadsheet.numColumns, type.columns.length);
        if (!spreadsheet.sheetsByName.hasOwnProperty(sheetName)) {
            spreadsheet.sheetsByName[sheetName] = {
                typeName,
                sheetName,
                path,
                type,
            };
            spreadsheet.sheetNames.push(sheetName);
        }
        let row = {
            typeName,
            sheetName,
            values,
            path,
        };
        spreadsheet.rows.push(row);

        if (type.hasOwnProperty('fields')) {
            type.fields.every((key) => {
                Treesheet.createRows(props, spreadsheet, [obj[key]], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }

        if (type.hasOwnProperty('arrays')) {
            type.arrays.every((key) => {
                Treesheet.createRows(props, spreadsheet, obj[key], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }
    }

    static createRows(props, spreadsheet, aList, path = []) {
        aList.every((obj, iObj) => {
            Treesheet.createRow(props, spreadsheet, obj, [...path, iObj]);
            return obj;
        });
    }

    static createSpreadsheet(props) {

        let spreadsheet = {
            name: props.name,
            sheetsByName: {},
            sheetNames: [],
            rows: [],
            numColumns: 0,
            columns: [],
        };

        Treesheet.createRows(props, spreadsheet, props.dataTree);
        Treesheet.updateSpreadsheetOpenRows(spreadsheet);

        return spreadsheet;
    }

    static updateSpreadsheetOpenRows(spreadsheet) {
        let openIndent = -1;
        spreadsheet.openRows = spreadsheet.rows.filter((row) => {
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
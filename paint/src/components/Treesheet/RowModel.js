import {getValueByPath} from "../../general/Utils";
import {cloneObject} from "../../redux/PathUtils";

export default class RowModel {

    constructor(props) {
        this.props = props;
        this.sheetsByName = {};
        this.sheetNames = [];
        this.rows = [];
        this.numColumns = 0;
        this.columns = [];

        this.createRows(this.props.dataTree);
        this.updateSpreadsheetOpenRows();
    }

    createRow(obj, path) {
        let {types} = this.props;

        let typeName = obj['type'];
        if (!typeName || !types.hasOwnProperty(typeName))
            typeName = obj['table'];
        let type = types[typeName];
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
                this.createRow(obj[key], [...path, key]);
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

    duplicateRow(iFirstRow) {
        let iRow = iFirstRow;
        let iSplicePoint = iFirstRow;
        let newRows = [];
        let indent = this.rows[iRow].path.length;
        while (iRow < this.rows.length && (iRow === iFirstRow || this.rows[iRow].path.length > indent)) {
            let newRow = cloneObject(this.rows[iRow]);
            newRow.path[indent - 1]++;
            newRows.push(newRow);
            iRow++;
        }
        if (newRows.length > 0) {
            iSplicePoint = iRow;
            while (iRow < this.rows.length && this.rows[iRow].path.length >= indent) {
                this.rows[iRow].path[indent - 1]++;
                iRow++;
            }
            this.rows.splice(iSplicePoint, 0, ...newRows);
        }
        this.updateSpreadsheetOpenRows();
        return iSplicePoint;
    }

    deleteRow(iFirstRow) {
        let iRow = iFirstRow;
        let iSplicePoint = iFirstRow;
        let deleteCount = 0;
        let indent = this.rows[iRow].path.length;
        while (iRow < this.rows.length && (iRow === iFirstRow || this.rows[iRow].path.length > indent)) {
            iRow++;
            deleteCount++;
        }
        while (iRow < this.rows.length && this.rows[iRow].path.length >= indent) {
            this.rows[iRow].path[indent - 1]--;
            iRow++;
        }
        this.rows.splice(iSplicePoint, deleteCount);

        this.updateSpreadsheetOpenRows();
        return iSplicePoint;
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


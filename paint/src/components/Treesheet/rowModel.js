import {getValueByPath} from "../../general/utils";
import {cloneObject} from "../../redux/pathUtils";

export default class RowModel {

    constructor(props) {
        this.props = props;
        this.sheetsByName = {};
        this.sheetNames = [];
        this.rows = [];
        this.numColumns = 0;
        this.columns = [];

        this._createRows(this.props.dataTree);
        this._updateSpreadsheetOpenRows();
    }

    _createRow(obj, path) {
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
                this._createRow(obj[key], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }

        if (type.hasOwnProperty('arrays')) {
            type.arrays.every((key) => {
                this._createRows(obj[key], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }
    }

    _createRows(aList, path = []) {
        aList.every((obj, iObj) => {
            this._createRow(obj, [...path, iObj]);
            return obj;
        });
    }

    duplicateRow(iFirstRow) {
        let path = this.rows[iFirstRow].path;
        this.props.duplicatePath(path);

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

        this._updateSpreadsheetOpenRows();
        return iSplicePoint;
    }

    deleteRow(iFirstRow) {
        let path = this.rows[iFirstRow].path;
        this.props.deletePath(path);

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

        this._updateSpreadsheetOpenRows();
        return iSplicePoint;
    }

    toggleOpen(row) {
        row.isOpen = !row.isOpen;
        this._updateSpreadsheetOpenRows();
    }

    _updateSpreadsheetOpenRows() {
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


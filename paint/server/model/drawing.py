# Copyright (C) 2019 Kevin Matte - All Rights Reserved

from model.table import Table


class Drawing(Table):
    table_name = 'model'

    def __init__(self):
        super(Drawing, self).__init__(self.table_name, {'id':int, 'userid':int, 'name': str})

class Graph(Table):
    table_name = 'graph'

    def __init__(self):
        super(Graph, self).__init__(self.table_name, {'id':int, 'type':str, 'name':str, 'drawingid':int})

class Vector3(Table):
    table_name = 'vector3'

    def __init__(self):
        super(Vector3, self).__init__(
            self.table_name,
            {
                'id':int,
                'graphid':int,
                'type':str,
                'name':str,
                'x1':int,
                'x2':int,
                'x3':int
            }
        )



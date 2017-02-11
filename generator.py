class Cell:
    def __init__(self):
        self.north = True
        self.east = True
        self.south = True
        self.west = True

    def __repr__(self):
        north = "N" if self.north==True else "n"
        east = "E" if self.east==True else "e"
        south = "S" if self.south==True else "s"
        west = "W" if self.west==True else "w"
        return "("+north+"-"+east+"-"+south+"-"+west+")"

class Maze:
    def __init__(self, rows, cols):
        self.grid = [[Cell() for col in range(cols)] for row in range(rows)]

    def __repr__(self):
        output = ""
        for row in self.grid:
            for cell in row:
                output += str(cell) + " "
            output += "\n"
        return output


maze = Maze(6,4)
print maze

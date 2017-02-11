import json

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

    def knockdown(self, sides):
        if 'n' in sides:
            self.north = False
        if 'e' in sides:
            self.east = False
        if 's' in sides:
            self.south = False
        if 'w' in sides:
            self.west = False

class Maze:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.grid = [[Cell() for col in range(cols+2)] for row in range(rows+2)]

    def __repr__(self):
        output = ""
        for row in self.grid:
            for cell in row:
                output += str(cell) + " "
            output += "\n"
        return output

    def knockdown(self, position, sides):
        x, y = position

        # Knock down the walls of the selected cell
        self.grid[y][x].knockdown(sides)

        # That's good house keepin'
        for side in sides:
            if side == 'n' and y > 0:
                self.grid[y-1][x].knockdown('s')
            if side == 'e' and x < self.cols+1:
                self.grid[y][x+1].knockdown('w')
            if side == 's' and y < self.rows+1:
                self.grid[y+1][x].knockdown('n')
            if side == 'w' and x > 0:
                self.grid[y][x-1].knockdown('e')

config = json.load(open('example.json'))

maze = Maze(config['rows'], config['cols'])

maze.knockdown((0,0), 'nesw')

print maze

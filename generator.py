import json
import random

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

        # Clear the cells around the edge of the maze
        for x in range(cols+2):
            self.grid[0][x].knockdown('new')
            self.grid[rows+1][x].knockdown('esw')
        for y in range(rows+2):
            self.grid[y][0].knockdown('nsw')
            self.grid[y][rows+1].knockdown('nes')

    def __repr__(self):
        output = ""
        for row in self.grid:
            for cell in row:
                output += str(cell) + " "
            output += "\n"
        return output

    def getCell(self, position):
        x, y = position
        return self.grid[y][x]

    def getNeighbourPositions(self, position):
        x, y = position
        output = set()
        for x2 in [x-1, x+1]:
            if x2 > 0 and x2 < self.cols+1:
                output.add((x2, y))
        for y2 in [y-1, y+1]:
            if y2 > 0 and y2 < self.rows+1:
                output.add((x, y2))
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

    def ascii(self):
        output = ''
        for y in range(self.rows):
            output+= '+'
            row = self.grid[y+1][1:-1] # skip padding
            for cell in row:
                output+= ('-' if cell.north else ' ') * 3
                output+= '+'
            output+= '\n'
            output+= '|' if row[0].west else ' '
            for cell in row:
                output+= ' ' * 3
                output+= '|' if cell.east else ' '
            output+= '\n'
            if y == self.rows - 1:
                output += '+'
                for cell in row:
                    output+= ('-' if cell.south else ' ') * 3
                    output+= '+'
                output+= '\n'
        return output

class Miner:
    def __init__(self, maze):
        self.maze = maze
        self.chart = { 'u': 'n', 'r': 'e', 'd': 's', 'l': 'w' }
        self.unvisited = {(x+1, y+1) for x in range(maze.cols) for y in range(maze.rows)}
        self.neighbours = set()

    def setPosition(self, position):
        self.pos = position

    def getRandomNeighbour(self):
        nextCell = random.sample(self.neighbours,1)
        return nextCell[0]

    def getDirection(self, pos1, pos2):
        x1, y1 = pos1
        x2, y2 = pos2
        direction = ''
        if x2-x1 > 0:
            direction = 'r'
        elif x2-x1 < 0:
            direction = 'l'
        if y2-y1 > 0:
            direction = 'd'
        elif y2-y1 < 0:
            direction = 'u'
        return direction

    def mine(self, direction):
        self.maze.knockdown(self.pos, self.chart[direction])

        if direction == 'u':
            self.pos[1] -= 1
        elif direction == 'r':
            self.pos[0] += 1
        elif direction == 'd':
            self.pos[1] += 1
        elif direction == 'l':
            self.pos[0] -= 1

        pos = tuple(self.pos)
        if pos in self.unvisited:
            self.unvisited.remove(pos)
            if pos in self.neighbours:
                self.neighbours.remove(pos)

            # Now add the neighbours to self.neighbours
            neighbours = self.maze.getNeighbourPositions(pos)
            self.neighbours = self.neighbours.union(self.unvisited.intersection(neighbours))

    def solve(self, solution):
        self.setPosition(solution['start'])
        for move in solution['path']:
            self.mine(move)
        return self.maze

    def newPath(self):
        # start a new path from the part of the maze already mined
        self.setPosition(list(self.getRandomNeighbour()))
        myNeighbours = self.maze.getNeighbourPositions(self.pos)

        # update the unvisited and neighbour sets
        pos = tuple(self.pos)
        self.unvisited.remove(pos)
        self.neighbours.remove(pos)
        self.neighbours = self.neighbours.union(self.unvisited.intersection(myNeighbours))

        # find a neighbour that is already in the maze
        neighboursInMaze = myNeighbours.difference(self.unvisited)
        pathCell = random.sample(neighboursInMaze,1)[0]

        directionToPath = self.getDirection(pos, pathCell)
        self.maze.knockdown(pos, self.chart[directionToPath])

    def randomWalk(self):
        myNeighbours = self.maze.getNeighbourPositions(self.pos)
        unvisitedNeighbours = self.unvisited.intersection(myNeighbours)
        #choose a random direction
        while len(unvisitedNeighbours) > 0:
            nextCell = random.sample(unvisitedNeighbours,1)[0]
            direction = self.getDirection(self.pos, nextCell)
            self.mine(direction)

            myNeighbours = self.maze.getNeighbourPositions(self.pos)
            unvisitedNeighbours = self.unvisited.intersection(myNeighbours)

    def generateMaze(self):
        while len(self.unvisited) > 0:
            self.newPath()
            self.randomWalk()
        return self.maze

config = json.load(open('example.json'))

maze = Maze(config['rows'], config['cols'])

miner = Miner(maze)
maze = miner.solve(config['solution'])

maze = miner.generateMaze()

#print(maze)
print(maze.ascii())

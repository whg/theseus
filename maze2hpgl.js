
function Cell(row, col) {

    var _row = row, _col = col;

    this.links = {};
    this.north = false;
    this.east = false;
    this.south = false;
    this.west = false;

    this.id = row + "," + col;

    this.link = function(cell, bidirectional) {
        this.links[cell.id] = true;

        if (bidirectional === undefined || bidirectional) {
            cell.link(this, false);
        }

        return this;
    };

    this.unlink = function(cell, bidirectional) {
        delete this.links[cell.id];

        if (bidirectional === undefined || bidirectional) {
            cell.unlink(this, false);
        }

        return this;
    };

    this.getLinks = function() {
        return Object.keys(this.links);
    };

    this.isLinked = function(cell) {
        return cell.id in this.links;
    };

    this.neighbours = function() {
        var output = [];
        if (this.north) output.push(this.north);
        if (this.east) output.push(this.east);
        if (this.south) output.push(this.south);
        if (this.west) output.push(this.west);
        return output;
    };

    this.cut = function(direction, other) {
        this[direction] = false;
        other[oppositeDirection(direction)] = false;

    }

	function oppositeDirection(dir) {
		switch (dir) {
		case "east": return "west";
		case "west": return "east";
		case "north": return "south";
		case "south": return "north";
		}
	}
}


function Graph() {
    // i, j == x, y == col, row

    var data = {};
    var maxI = 0, maxJ = 0;

    this.toId = function(i, j) {
        return j + "," + i;
    };

    this.get = function(i, j) {
        var id = this.toId(i, j);
        if (data[id] === undefined) {
            data[id] = new Cell(j, i);

            // keep track of what's been got
            if (j > maxJ) maxJ = j;
            if (i > maxI) maxI = i;
        }
        return data[id];
    };

    this.toString = function() {
        return data;
    };

    function getKeyParts(key) {
        var parts = key.split(",");
        return {
            "i": parseInt(parts[1]),
            "j": parseInt(parts[0]),
        };
    }

    this.configure = function() {
        for (var key in data) {
            var currentParts = getKeyParts(key);
            var currentCell = data[key];
            for (var okey in currentCell["links"]) {
                var parts = getKeyParts(okey);
                if (parts.i == currentParts.i + 1) {
                    currentCell.east = this.toId(parts.i, currentParts.j);
                }
                else if (parts.i == currentParts.i - 1) {
                    currentCell.west = this.toId(parts.i, currentParts.j);
                }

                if (parts.j == currentParts.j + 1) {
                    currentCell.south = this.toId(currentParts.i, parts.j);
                }
                else if (parts.j == currentParts.j - 1) {
                    currentCell.north = this.toId(currentParts.i, parts.j);
                }
            }
        }
    };

    this.walls = function() {

        var directions = ["east", "south", "west", "north"];
        var directionIndex = 0;

        function currentDirection() {
            return directions[directionIndex];
        }

        function switchDirection() {
            directionIndex = (directionIndex + 1) % directions.length;
            return directionIndex !== 0;
        }

        var paths = [[]];
        var currentPath = 0;

        function addPoint(cellId) {
            paths[currentPath].push(cellId);
        }

        function addPath() {
            paths.push([]);
            currentPath++;
        }


        function dive(cell, switched) {

            var dir = currentDirection();

            if (cell[dir]) {
                // we're can go in the current direction
                var next = data[cell[dir]];

                // remove connections between us and next
                cell.cut(dir, next);

                // log the point
                addPoint(cell.id);

                // move on!
                dive(next);
            }
            else {
                // we need to try a new direction
                switchDirection();

                // don't log a point if we switched one step before
                if (switched === undefined) {
                    addPoint(cell.id);
                }

                // if we have somewhere to go, try!
                if (cell.neighbours().length > 0) {
                    dive(cell, true);
                }

            }

            // we are now backtracking
            // if there are undiscovered places, go for it.
            if (cell.neighbours().length > 0) {
                addPath();
                dive(data[cell.id], true);
            }


        }


        // addPoint(currentCell.id);
        dive(this.get(0, 0));
        addPath();
        dive(this.get(maxI, maxJ));


        // console.log(paths);
        // produces something like:
        // [ [ '0,0', '0,1', '0,2', '0,3', '0,4', '0,5', '0,5', '1,5', '2,5', '3,5' ],
        //   [ '2,5', '2,4', '2,3' ],
        //   [ '2,4', '1,4', '1,4', '1,3', '1,2' ] ]


        // the next phase is to remove the intermediate steps where the line
        // is straight

        var segmented_paths = paths.map(function(path) {
            var segments = [path[0]];
            for (var i = 1; i < path.length; i++) {
                if (path[i - 1] === path[i]) {
                    segments.push(path[i]);
                }
            }
            segments.push(path[path.length - 1]);
            return segments;
        });

        // console.log(segmented_paths);
        // now
        // [ [ '0,0', '0,5', '3,5' ],
        //   [ '2,5', '2,3' ],
        //   [ '2,4', '1,4', '1,2' ] ]

        var xy_paths = segmented_paths.map(function(path) {
            return path.map(function(key) {
                var obj = getKeyParts(key);
                return { "x": obj.i, "y": obj.j };
            });
        });

        var output = {
            "paths" : xy_paths,
        };

        // return JSON.stringify(output);
        return xy_paths;
    };

}

function parse(maze) {

    var lines = maze.trim().split("\n");

    var numHLines = Math.ceil(lines.length / 2);
    var numVLines = null;
    var graph = new Graph();


    var currentJ = 0; // row (in nodes)
    var step = 4;

    lines.forEach(function(line, lineNum) {

        var lineList = line.split('');

        var numNodes = Math.ceil(lineList.length / step);
        if (!numVLines) {

            if (lineList.length % 2 == 0) {
                throw "Invalid line, length is even";
            }

            numVLines = numNodes;
        }
        else {
            if (numVLines != numNodes) {
                throw "Line length mismatch, was " + numVLines + ", now " + numNodes;
            }
        }

        if (lineNum % 2 == 0) {

            if (lineList[0] !== "+") {
                throw "Bad start character, looking for +, received " + lineList[0];
            }

            for (var i = 1; i < lineList.length; i+= step) {
                if (lineList[i] == "-") {
                    var current = graph.get(Math.floor(i / step), currentJ);
                    var next = graph.get(Math.ceil(i / step), currentJ);
                    current.link(next);
                }
            }
        }
        else {
            for (var i = 0; i < lineList.length; i+= step) {
                if (lineList[i] == "|") {
                    graph.get(i / step, currentJ).link(graph.get(i / step, currentJ + 1));
                }
            }
            currentJ++;
        }
    });

    graph.configure();

    return graph;
}

function toHPGL(paths, offset, unitLength) {
    var output = "SP1;VS3;";

    function point(p) {
        return (p.x * unitLength + offset.x) + "," + (p.y * unitLength + offset.y);
    }

    paths.forEach(function(path) {
        output+= "PU" + point(path[0]) + ";";
        output+= "PD" + point(path[0]) + ",";
        for (var i = 1; i < path.length; i++) {
            output+= point(path[i]);

            if (i != path.length - 1) {
                output+= ",";
            }
        }
        output+= ";";
    });

    output+= "PU0,0;";

    return output;
}

function getOptions() {
	var options = {};
	process.argv.slice(2).forEach(function(arg) {
		var result = arg.match(/-(xo|yo|ul)=(\d+)/);
		if (result) {
			options[result[1]] = result[2];
		}
	});
	return options;
}

function printHPGL(maze) {
	var mazeGraph = parse(maze).walls();

	var options = getOptions();
	var offset = {
		'x': options.xo || 5000,
		'y': options.yo || 5000
	};
	var unitLength = options.ul || 100;
	
	console.log(toHPGL(mazeGraph, offset, unitLength));
}

/////////////////////////////////////////////////////////////////////////////

var filename = process.argv.slice(2).filter(function(e) {
	return e.charAt(0) !== '-';
})[0];

if (filename) {
	// a filename has been specified...
	
	var fs = require('fs');
	var filename = process.argv[2];
	printHPGL(fs.readFileSync(filename, 'utf8'));
}
else {
	// read from stdin
	
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	var maze = '';

	process.stdin.on('data', function(chunk) {
		maze+= chunk;
	});

	process.stdin.on('end', function() {
		printHPGL(maze);
	});
}


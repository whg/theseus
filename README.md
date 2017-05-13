# theseus

Making mazes from solutions

## maze2hpgl

Takes an ASCII maze from either a file or `stdin` and prints HPGL.

Options are:

`-xo`: x offset in plotter units (default = 5000)
`-yo`: y offset in plotter units, (default = 5000)
`-ul`: side length of one maze cell (default = 100)

### Usage

`node maze2hpgl.js example_maze.txt -xo=3141 -yo=567`

`cat example_maze.txt | node maze2hpgl.js example_maze.txt -ul=50`


# Scythe
#### A recursive file and directory cleaner

###Installation:

    npm install -g

###Usage: 

    scythe [options] <directories>

###Options:

    -f, --force       force file deletion
    -t, --threshold   file deletion threshold  [7d]
    -v, --verbose  
    
Scythe will walk through directories listed (or current directory) and determine if the files are older (last modified) than the threshold, which defaults to 7 days. If ```-f``` is set, these files will be deleted. Scythe will also remove sub-directories that are now empty, but will never remove the directory you passed.

Without passing ```-f```, scythe will run in simulation mode, printing to the command prompt which files will be deleted.

###Note: 

Scythe's directory listing in simulation mode differs from ```force``` mode due to ```force``` mode's deletions making subdirectories empty. 

###License:

MIT
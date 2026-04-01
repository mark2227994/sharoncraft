const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.git') || file.includes('.vscode') || file.includes('images') || file.includes('supabase')) {
            if (!--pending) done(null, results);
            return;
          }
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(rootDir, (err, files) => {
  if (err) throw err;
  const targetExts = ['.html', '.js', '.css'];
  let updatedFilesCount = 0;
  
  files.forEach(file => {
    if (targetExts.includes(path.extname(file).toLowerCase())) {
      let content = fs.readFileSync(file, 'utf8');
      
      const regex = /(assets\/images\/[^"'\s\)]+)\.(jpg|jpeg|png)/gi;

      // Handle cases where the extension matches, replacing it with .webp
      if (regex.test(content)) {
        // Reset lastIndex since using test() advances it
        const newContent = content.replace(/(assets\/images\/[^"'\s\)]+)\.(jpg|jpeg|png)/gi, '$1.webp');
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated paths in ${file}`);
            updatedFilesCount++;
        }
      }
    }
  });
  console.log(`Replaced image extensions in ${updatedFilesCount} files.`);
});

const fs = require('fs');
const postcss = require('postcss');

const plugin = postcss.plugin('mobile-first-refactor', () => {
  return (root) => {
    let max820Nodes = [];
    let max540Nodes = [];

    // Collect all max-width queries
    root.walkAtRules('media', (rule) => {
      if (rule.params.includes('max-width: 820px')) max820Nodes.push(rule);
      if (rule.params.includes('max-width: 540px')) max540Nodes.push(rule);
    });

    const processMaxWidth = (mediaQueryNodes, minWidthVal) => {
      mediaQueryNodes.forEach((mq) => {
        let minWidthMq = postcss.atRule({ name: 'media', params: `(min-width: ${minWidthVal}px)` });
        
        mq.walkRules((mobileRule) => {
          if (mobileRule.parent.type === 'atrule' && mobileRule.parent.name === 'media' && mobileRule.parent !== mq) {
             return;
          }

          const selector = mobileRule.selector;
          const rootRules = [];
          
          root.walkRules((r) => {
            if (r.parent === root && r.selector === selector) {
              rootRules.push(r);
            }
          });

          if (rootRules.length > 0) {
            let minWidthRule = postcss.rule({ selector: selector });

            mobileRule.walkDecls((mobileDecl) => {
              let foundDesktopDecl = false;
              
              for (let i = rootRules.length - 1; i >= 0; i--) {
                let r = rootRules[i];
                let desktopDecl = null;
                
                r.walkDecls((d) => {
                  if (d.prop === mobileDecl.prop) {
                    desktopDecl = d;
                  }
                });

                if (desktopDecl) {
                  minWidthRule.append(desktopDecl.clone());
                  desktopDecl.replaceWith(mobileDecl.clone());
                  foundDesktopDecl = true;
                  break; // Found the property in desktop base, processed it
                }
              }

              if (!foundDesktopDecl) {
                // Property wasn't in desktop base, it's a mobile-only addition. 
                rootRules[rootRules.length - 1].append(mobileDecl.clone());
              }
            });

            if (minWidthRule.nodes && minWidthRule.nodes.length > 0) {
              minWidthMq.append(minWidthRule);
            }
          } else {
            // No equivalent root rule, move it directly to base scope
            root.append(mobileRule.clone());
          }
        });

        if (minWidthMq.nodes && minWidthMq.nodes.length > 0) {
            root.append(minWidthMq);
        }
        mq.remove(); // Safely remove the max-width query
      });
    };

    // Refactor 820px first -> pushes original desktop to min-width: 821px
    processMaxWidth(max820Nodes, 821);
    
    // Refactor 540px next -> pushes new tablet/desktop to min-width: 541px
    processMaxWidth(max540Nodes, 541);
  };
});

const cssPath = 'c:\\Users\\USER\\Desktop\\projects\\bead VN2\\assets\\css\\style.css';
const css = fs.readFileSync(cssPath, 'utf8');

console.log('Processing mobile-first refactoring via POSTCSS...');

postcss([plugin])
  .process(css, { from: cssPath, to: cssPath })
  .then((result) => {
    fs.writeFileSync(cssPath, result.css);
    console.log('Successfully refactored style.css to Mobile First!');
  })
  .catch((err) => {
    console.error('Error during refactoring:', err);
  });

const t = require('@babel/types');
const template = require('@babel/template').default;
const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');

const getVueFileName = (filepath) => {
  let filename = /(\w+)\.vue$/.exec(filepath);
  if (filename) {
    [, filename] = filename;
  }

  return filename;
};

const getMixinTmpl = () => {
  const mixinTmpl = `
    const mixin = {
      props: {
        nodeid: {
          type: String,
          default() {
            let p = this.$parent;
            while (p && !p.root) {
              p = p.$parent;
            }
            return p && p.nodeid;
          },
        },
        tplid: {
          type: String,
          default() {
            let p = this.$parent;
            while (p && !p.root) {
              p = p.$parent;
            }
            return p && p.tplid;
          },
        },
        root: {
          type: String,
          default: false,
        },
      },
      created() {
        /* eslint-disable-next-line */
        this.bridge = iBridge.getBridge(this._uid);
      },
      destroyed() {
        this.bridge.destroy();
      },
      data() {
        return {
          visible: false,
        };
      },
      methods: {
        show() {
          if (this.visible) return;
          this.visible = true;
          if (this.root === 'true') {
            this.bridge.showInteract();
            this.bridge.report({
              type: 'show',
              compid: this.nodeid,
              tplid: this.tplid,
            });
          }
        },
        hide() {
          if (!this.visible) return;
          this.visible = false;
          if (this.root === 'true') {
            this.bridge.hideInteract();
            this.bridge.report({
              type: 'hide',
              compid: this.nodeid,
              tplid: this.tplid,
            });
          }
        },
        proxy(codeHash, func) {
          const context = this;
          return function (e) {
            func(e);
            let touch = e.touches && e.touches[0];
            if (!touch) {
              touch = e.changedTouches && e.changedTouches[0];
            }
            if (!touch) {
              touch = e;
            }
    
            let widgetId = codeHash;
            let { target } = e;
            while (target && target.dataset) {
              const { report } = target.dataset;
              if (report && typeof report === 'string') {
                widgetId = report;
                break;
              }
              target = target.parentNode;
            }
            const pPos = context.bridge.px2Percent({
              x: touch.pageX || 0,
              y: touch.pageY || 0,
            });
            context.bridge.report({
              type: e.type,
              x: pPos.x,
              y: pPos.y,
              compid: context.nodeid,
              tplid: context.tplid,
              widgetid: widgetId,
            });
          };
        },
      },
    };
  `;
  return mixinTmpl;
};

const getAstDefaultPropsProperties = () => {
  const defaultPropsTmpl = `const defaultProps = {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 10,
    },
    height: {
      type: Number,
      default: 5,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    endTime: {
      type: Number,
      default: 0,
    },
  }`;

  return template.ast(defaultPropsTmpl).declarations[0].init.properties;
};

const addDefualtProps = (path) => {
  const { properties } = path.node.declaration;

  let propsPerperties = properties.find((item) => item.key.name === 'props');

  if (!propsPerperties) {
    // 如果没有定义 props 属性，手动添加 props: {}
    propsPerperties = t.objectProperty(
      t.identifier('props'),
      t.objectExpression([]),
    );
    properties.push(propsPerperties);
  }

  const astDefaultPropsProperties = getAstDefaultPropsProperties();

  propsPerperties.value.properties.push(...astDefaultPropsProperties);
};

const addMixin = (path) => {
  const { properties } = path.node.declaration;

  let mixinsProperty = properties.find((item) => item.key.name === 'mixins');
  if (mixinsProperty) {
    throw new ReferenceError('组件不允许使用 mixins 属性');
  }

  mixinsProperty = t.objectProperty(
    t.identifier('mixins'),
    t.arrayExpression([t.identifier('mixin')]),
  );

  properties.push(mixinsProperty);
};

const visitor = {
  ExportDefaultDeclaration(path) {
    const vueFileName = getVueFileName(this.filename);
    if (!vueFileName) {
      return;
    }

    // 只处理 export default {} 这种情况
    if (path.node.declaration.type !== 'ObjectExpression') {
      return;
    }

    addDefualtProps(path);

    addMixin(path);

    let { code } = generate(path.node);
    const VFileName = `V${vueFileName}`;
    code = code.replace('export default', `const ${VFileName} =`);

    code = getMixinTmpl() + code;

    code += `window._interactComps = Object.assign(window._interactComps || {}, { ${VFileName} });`;
    code += `export default ${VFileName}`;

    const resultAst = babelParser.parse(code, {
      sourceType: 'module',
    });

    path.replaceWithMultiple(resultAst.program.body);
  },
  ImportDeclaration() {
    throw new ReferenceError('组件不允许使用 import 语法');
  },
};

module.exports = () => ({
  visitor,
});

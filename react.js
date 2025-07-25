function react() {
    let currentComponent = null;
    let hooks = {};
    let hookIndex = 0;

    const virtualDom = {};
    const componentDefs = {};

    return {
        render(rootElm, ComponentFn) {
            // Store focused element & selection
            const activeEl = document.activeElement;
            const selectionStart = activeEl?.selectionStart;
            const selectionEnd = activeEl?.selectionEnd;
            const activeId = activeEl?.id;
        
            currentComponent = ComponentFn.name;
            hookIndex = 0;
        
            componentDefs[currentComponent] = ComponentFn;
        
            const vnode = ComponentFn();
            const domNode = this.renderElement(vnode);
            rootElm.innerHTML = '';
            rootElm.appendChild(domNode);
            virtualDom.root = vnode;
        
            // Restore focus and cursor
            if (activeId) {
                const newActiveEl = document.getElementById(activeId);
                if (newActiveEl) {
                    newActiveEl.focus();
                    if (selectionStart != null && selectionEnd != null) {
                        newActiveEl.setSelectionRange(selectionStart, selectionEnd);
                    }
                }
            }
        },

        useState(initialValue) {
            const id = currentComponent + '-' + hookIndex;
        
            if (!(id in hooks)) {
                hooks[id] = initialValue;
            }
        
            const setState = (newVal) => {
                hooks[id] = newVal;
                this.rerender();
            };
        
            hookIndex++; // <<==== ADD THIS LINE HERE
        
            return [hooks[id], setState];
        },

        rerender() {
            const root = document.getElementById('root');
            const ComponentFn = componentDefs[currentComponent];
            if (ComponentFn) {
                this.render(root, ComponentFn);
            }
        },

        renderElement(vnode) {
            if (!vnode) return null;
        
            if (typeof vnode === 'string' || typeof vnode === 'number') {
                return document.createTextNode(String(vnode));
            }
        
            if (typeof vnode === 'function') {
                vnode = vnode(); // component
            }
        
            const el = document.createElement(vnode.tag);
        
            // set attributes
            for (let [key, value] of Object.entries(vnode.attributes || {})) {
                if (key.startsWith('on') && typeof value === 'function') {
                    el[key.toLowerCase()] = value;
                } else {
                    el.setAttribute(key, value);
                }
            }
        
            for (let child of vnode.children || []) {
                el.appendChild(this.renderElement(child));
            }
        
            return el;
        },

        createElement(tag, attrs = {}, ...children) {
            if (typeof tag === 'function') {
                return tag({ ...attrs });
            }

            const flatChildren = children.flat().map(child =>
                typeof child === 'string' || typeof child === 'number' ? String(child) : child
            );

            return {
                tag,
                attributes: attrs || {},
                children: flatChildren
            };
        }
    };
}

const React = new react();
export default React;

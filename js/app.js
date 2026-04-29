let currentCategory = "";
let currentFormula = "";

const DOM = {
    sidebar: document.getElementById('sidebar'),
    subSelect: document.getElementById('sub-selector'),
    dynamicForm: document.getElementById('dynamic-form'),
    btnCalc: document.getElementById('btn-calc'),
    output: document.getElementById('output-val')
};

function initApp() {
    const categories = Object.keys(DB);
    currentCategory = categories[0];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${cat === currentCategory ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => switchCategory(cat, btn);
        DOM.sidebar.appendChild(btn);
    });
    populateSubSelect();
    DOM.subSelect.addEventListener('change', (e) => {
        currentFormula = e.target.value;
        renderForm();
    });
    DOM.btnCalc.addEventListener('click', executeCalculation);
}

function switchCategory(cat, btnElement) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    currentCategory = cat;
    populateSubSelect();
}

function populateSubSelect() {
    DOM.subSelect.innerHTML = "";
    const formulas = Object.keys(DB[currentCategory]);
    currentFormula = formulas[0];
    formulas.forEach(form => {
        const opt = document.createElement('option');
        opt.value = form;
        opt.textContent = form;
        DOM.subSelect.appendChild(opt);
    });
    renderForm();
}

function renderForm() {
    DOM.dynamicForm.innerHTML = "";
    DOM.output.textContent = "MENUNGGU INPUT...";
    DOM.output.style.color = "#a1a1aa";
    const fields = DB[currentCategory][currentFormula].inputs;

    fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'input-group';

        const label = document.createElement('label');
        label.textContent = f.label;
        group.appendChild(label);

        if (f.t === 'sel') {
            const select = document.createElement('select');
            select.id = f.id;
            f.o.split(',').forEach(optVal => {
                const option = document.createElement('option');
                option.value = optVal;
                option.textContent = optVal;
                select.appendChild(option);
            });
            group.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = f.t === 'number' ? 'number' : 'text';
            if (f.t === 'number') input.step = 'any';
            input.id = f.id;
            if (f.d) input.value = f.d;
            group.appendChild(input);
        }

        if (currentCategory === "Kalkulator Dasar" && f.id === "expr") {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = "keypad-toggle";
            toggleBtn.textContent = "⌨️ Numpad";
            group.appendChild(toggleBtn);

            const keypad = document.createElement('div');
            keypad.className = "keypad-grid";
            keypad.style.display = "none";

            const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'];
            keys.forEach(k => {
                const kb = document.createElement('button');
                kb.className = `keypad-btn ${k === 'C' ? 'clear' : (['/', '*', '-', '+'].includes(k) ? 'action' : '')}`;
                kb.textContent = k;
                kb.type = "button";
                kb.onclick = (e) => {
                    e.preventDefault();
                    const inp = document.getElementById('expr');
                    if (k === 'C') inp.value = '';
                    else inp.value += k;
                };
                keypad.appendChild(kb);
            });

            toggleBtn.onclick = (e) => {
                e.preventDefault();
                keypad.style.display = keypad.style.display === "none" ? "grid" : "none";
            };

            group.appendChild(keypad);
        }

        DOM.dynamicForm.appendChild(group);
    });
}

function executeCalculation() {
    try {
        const fields = DB[currentCategory][currentFormula].inputs;
        const values = {};
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            values[f.id] = f.t === 'number' ? parseFloat(el.value) : el.value;
        });
        const result = DB[currentCategory][currentFormula].calc(values);
        DOM.output.textContent = (result === "NaN" || result === "undefined" || (typeof result === "number" && isNaN(result))) ? "ERROR: INPUT TIDAK VALID" : result;
        DOM.output.style.color = "#10b981";
    } catch (error) {
        DOM.output.textContent = "FATAL ERROR: SINTAKS SALAH";
        DOM.output.style.color = "#ef4444";
    }
}

window.addEventListener('DOMContentLoaded', initApp);
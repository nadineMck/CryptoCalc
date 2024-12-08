function clearOutput() {
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.value = '';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.id = 'clear-btn';
    clearBtn.style.cssText = `
        background-color: rgba(255, 87, 87, 0.7);
        margin-left: 10px;
    `;
    clearBtn.addEventListener('click', clearOutput);

    
    const resultContainer = document.querySelector('.result-container');
    if (resultContainer) {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            resultContainer.appendChild(clearBtn);
        }
    }
  
    const parameterOverlay = document.createElement('div');
    parameterOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 1000;
        display: none;
        justify-content: center;
        align-items: center;
    `;
    
    
    const paramPanel = document.createElement('div');
    paramPanel.style.cssText = `
        background: rgba(13, 22, 44, 0.8);
        width: 400px;
        padding: 30px;
        border-radius: 20px;
        backdrop-filter: blur(15px);
        position: relative;
    `;
    
    paramPanel.innerHTML = `
        <div style="position: absolute; top: 15px; right: 15px; cursor: pointer; font-size: 24px; color: var(--accent-primary);">✕</div>
        <h3 style="color: var(--accent-primary); margin-bottom: 20px;">Parameters</h3>
        <div style="display: grid; gap: 20px;">
            <div>
                <label style="color: var(--text-secondary); display: block; margin-bottom: 10px;">Inut Format</label>
                <select id="format-select" style="width: 100%; background: rgba(45, 57, 85, 0.6); color: white; border: none; padding: 12px; border-radius: 10px;">
                    <option>Binary</option>
                    <option>Hexadecimal</option>
                    <option>Polynomial</option>
                </select>
            </div>
              <div>
                <label style="color: var(--text-secondary); display: block; margin-bottom: 10px;">Output Format</label>
                <select id="format-select" style="width: 100%; background: rgba(45, 57, 85, 0.6); color: white; border: none; padding: 12px; border-radius: 10px;">
                    <option>Binary</option>
                    <option>Hexadecimal</option>
                    <option>Polynomial</option>
                </select>
            </div>
            <div>
                <label style="color: var(--text-secondary); display: block; margin-bottom: 10px;">Polynomial Field (e.g., GF(2^8))</label>
                <input type="text" id="field" style="width: 100%; background: rgba(45, 57, 85, 0.6); color: white; border: none; padding: 12px; border-radius: 10px;">
            </div>
            <div>
                <label style="color: var(--text-secondary); display: block; margin-bottom: 10px;">Optional Modulo Polynomial</label>
                <input type="text" id="modulo" style="width: 100%; background: rgba(45, 57, 85, 0.6); color: white; border: none; padding: 12px; border-radius: 10px;">
            </div>
        </div>
    `;
    
    parameterOverlay.appendChild(paramPanel);
    document.body.appendChild(parameterOverlay);
    
 
    const parameterToggle = document.createElement('div');
    parameterToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: rgba(126, 87, 194, 0.7);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 1001;
    `;
    parameterToggle.innerHTML = '⚙️';
    document.body.appendChild(parameterToggle);
    
 
    const termButtons1 = document.getElementById('term-buttons-1');
    const termButtons2 = document.getElementById('term-buttons-2');
    const formatSelect = paramPanel.querySelector('#format-select');

    function toggleTermButtons() {
        const selectedFormat = formatSelect.value.toLowerCase();

        if (selectedFormat === 'polynomial') {
            termButtons1.style.display = 'flex';
            termButtons2.style.display = 'flex';
        } else {
            termButtons1.style.display = 'none';
            termButtons2.style.display = 'none';
        }
    }

    toggleTermButtons();

    
    parameterToggle.addEventListener('click', () => {
        container.style.filter = 'blur(10px) brightness(0.3)';
        parameterOverlay.style.display = 'flex';
    });

    paramPanel.querySelector('div:first-child').addEventListener('click', () => {
        container.style.filter = 'none';
        parameterOverlay.style.display = 'none';
    });

    formatSelect.addEventListener('change', toggleTermButtons);

    const body = document.body;
    body.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth * 100).toFixed(2) + '%';
        const mouseY = (e.clientY / window.innerHeight * 100).toFixed(2) + '%';
        
        body.style.setProperty('--mouse-x', mouseX);
        body.style.setProperty('--mouse-y', mouseY);
    });
});
function addTermToInput(termValue, inputId) {
    const inputField = document.getElementById(inputId);

    if (!inputField.value.trim()) {
        inputField.value = termValue;
        return;
    }

    inputField.value += `${termValue}`;
}

const termButtonSets = [
    { buttons: document.querySelectorAll('#term-buttons-1 button'), inputId: 'poly1' },
    { buttons: document.querySelectorAll('#term-buttons-2 button'), inputId: 'poly2' }
];

termButtonSets.forEach(set => {
    set.buttons.forEach(button => {
        button.addEventListener('click', () => {
            const termValue = button.textContent.trim();
            addTermToInput(termValue, set.inputId);
        });
    });
});

function performOperation(operation) {
    const poly1 = document.getElementById('poly1').value;
    const poly2 = document.getElementById('poly2').value;
    const format = document.querySelector('#format-select').value;
    const field = document.getElementById('field').value;
    const modulo = document.getElementById('modulo').value;

    if (!poly1 || !poly2 ) {
        alert('Please enter both polynomials');
        return;
    }

    let result;
    switch (operation) {
        case 'add':
            result = `Addition of ${poly1} and ${poly2}`;
            break;
        case 'subtract':
            result = `Subtraction of ${poly1} and ${poly2}`;
            break;
        case 'multiply':
            result = `Multiplication of ${poly1} and ${poly2}`;
            break;
        case 'divide':
            result = `Division of ${poly1} by ${poly2}`;
            break;
        case 'modulo':
            result = `Modulo reduction of ${poly1}`;
            break;
        case 'inverse':
            result = `Inverse of ${poly1}`;
            break;
        default:
            result = 'Unknown operation';
    }

    document.getElementById('result').value = result;
}

function copyToClipboard() {
    const result = document.getElementById('result');
    result.select();
    navigator.clipboard.writeText(result.value)
        .then(() => alert('Result copied to clipboard!'))
        .catch(err => alert('Failed to copy text: ', err));
}

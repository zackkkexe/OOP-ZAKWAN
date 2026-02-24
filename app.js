function showPage(page) {
    const homePage = document.getElementById('homePage');
    const savedPage = document.getElementById('savedPage');
    const homeBtn = document.getElementById('homeBtn');
    const savedBtn = document.getElementById('savedBtn');
    
    if (page === 'home') {
        homePage.style.display = 'block';
        savedPage.style.display = 'none';
        homeBtn.className = 'menu-btn active';
        savedBtn.className = 'menu-btn';
    } else {
        homePage.style.display = 'none';
        savedPage.style.display = 'block';
        homeBtn.className = 'menu-btn';
        savedBtn.className = 'menu-btn active';
        loadSavedFruits();
    }
}

async function getFruitData() {
    try {
        const response = await fetch('https://www.fruityvice.com/api/fruit/all');
        const data = await response.json();
        
        const goal = document.getElementById('goalSelect').value;
        const container = document.getElementById('fruitContainer');
        container.innerHTML = '';
        
        let highestSugar = 0;
        let highestName = '';
        
        for (let i = 0; i < data.length; i++) {
            const fruit = data[i];
            let show = false;
            
            if (goal === 'all') {
                show = true;
            } else if (goal === 'lowcal' && fruit.nutritions.calories < 60) {
                show = true;
            } else if (goal === 'protein' && fruit.nutritions.protein > 1) {
                show = true;
            } else if (goal === 'lowsugar' && fruit.nutritions.sugar < 8) {
                show = true;
            }
            
            if (fruit.nutritions.sugar > highestSugar) {
                highestSugar = fruit.nutritions.sugar;
                highestName = fruit.name;
            }
            
            if (show) {
                const card = document.createElement('div');
                card.className = 'fruit-card';
                
                const nameEl = document.createElement('h4');
                nameEl.textContent = fruit.name;
                
                const calEl = document.createElement('p');
                calEl.textContent = 'Calories: ' + fruit.nutritions.calories;
                
                const sugarEl = document.createElement('p');
                sugarEl.textContent = 'Sugar: ' + fruit.nutritions.sugar + 'g';
                
                const proteinEl = document.createElement('p');
                proteinEl.textContent = 'Protein: ' + fruit.nutritions.protein + 'g';
                
                const fatEl = document.createElement('p');
                fatEl.textContent = 'Fat: ' + fruit.nutritions.fat + 'g';
                
                const carbsEl = document.createElement('p');
                carbsEl.textContent = 'Carbs: ' + fruit.nutritions.carbohydrates + 'g';
                
                const btn = document.createElement('button');
                btn.textContent = 'Save';
                btn.onclick = function() {
                    saveFruit(
                        fruit.name,
                        fruit.nutritions.calories,
                        fruit.nutritions.sugar,
                        fruit.nutritions.protein,
                        fruit.nutritions.fat,
                        fruit.nutritions.carbohydrates
                    );
                    btn.textContent = 'Saved!';
                    setTimeout(function() {
                        btn.textContent = 'Save';
                    }, 500);
                };
                
                card.appendChild(nameEl);
                card.appendChild(calEl);
                card.appendChild(sugarEl);
                card.appendChild(proteinEl);
                card.appendChild(fatEl);
                card.appendChild(carbsEl);
                card.appendChild(btn);
                
                container.appendChild(card);
            }
        }
        
        document.getElementById('sugarInfo').innerHTML = highestName + ' (' + highestSugar + 'g)';
        
    } catch (err) {
        alert('Error loading fruits. Check your connection.');
        console.log(err);
    }
}

function saveFruit(name, cal, sugar, pro, fat, carbs) {
    let saved = localStorage.getItem('myFruits');
    
    if (saved === null) {
        saved = [];
    } else {
        saved = JSON.parse(saved);
    }
    
    let found = false;
    for (let i = 0; i < saved.length; i++) {
        if (saved[i].name === name) {
            saved[i].quantity = saved[i].quantity + 1;
            found = true;
            break;
        }
    }
    
    if (found === false) {
        saved.push({
            name: name,
            calories: cal,
            sugar: sugar,
            protein: pro,
            fat: fat,
            carbs: carbs,
            quantity: 1
        });
    }
    
    localStorage.setItem('myFruits', JSON.stringify(saved));
}

function loadSavedFruits() {
    let saved = localStorage.getItem('myFruits');
    
    if (saved === null) {
        saved = [];
    } else {
        saved = JSON.parse(saved);
    }
    
    const container = document.getElementById('savedContainer');
    container.innerHTML = '';
    
    if (saved.length === 0) {
        container.innerHTML = '<p class="empty-msg">No saved fruits yet</p>';
        updateStats(saved);
        return;
    }
    
    let totalCal = 0;
    let totalSugar = 0;
    
    for (let i = 0; i < saved.length; i++) {
        const item = saved[i];
        const itemTotalCal = item.calories * item.quantity;
        const itemTotalSugar = item.sugar * item.quantity;
        
        totalCal = totalCal + itemTotalCal;
        totalSugar = totalSugar + itemTotalSugar;
        
        const card = document.createElement('div');
        card.className = 'saved-card';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'card-name';
        nameSpan.textContent = item.name;
        
        const qtySpan = document.createElement('span');
        qtySpan.className = 'card-qty';
        qtySpan.textContent = 'x' + item.quantity;
        
        header.appendChild(nameSpan);
        header.appendChild(qtySpan);
        
        const details = document.createElement('div');
        details.className = 'card-details';
        details.innerHTML = 
            '<p>Each: ' + item.calories + ' cal, ' + item.sugar + 'g sugar</p>' +
            '<p>Total: ' + itemTotalCal + ' cal, ' + itemTotalSugar.toFixed(1) + 'g sugar</p>' +
            '<p>Protein: ' + (item.protein * item.quantity).toFixed(1) + 'g</p>' +
            '<p>Fat: ' + (item.fat * item.quantity).toFixed(1) + 'g</p>' +
            '<p>Carbs: ' + (item.carbs * item.quantity).toFixed(1) + 'g</p>';
        
        const btnDiv = document.createElement('div');
        btnDiv.className = 'card-buttons';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() {
            showEditForm(i, item.name, item.quantity);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function() {
            deleteFruit(i);
        };
        
        btnDiv.appendChild(editBtn);
        btnDiv.appendChild(deleteBtn);
        
        card.appendChild(header);
        card.appendChild(details);
        card.appendChild(btnDiv);
        
        container.appendChild(card);
    }
    
    updateStats(saved, totalCal, totalSugar);
}

function showEditForm(index, name, currentQty) {
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('editFruitName').textContent = name;
    document.getElementById('editQuantity').value = currentQty;
    localStorage.setItem('editingIndex', index);
}

function saveEdit() {
    const index = localStorage.getItem('editingIndex');
    const newQty = document.getElementById('editQuantity').value;
    
    if (newQty === '' || newQty < 1) {
        alert('Please enter a valid quantity');
        return;
    }
    
    let saved = JSON.parse(localStorage.getItem('myFruits'));
    saved[index].quantity = parseInt(newQty);
    
    localStorage.setItem('myFruits', JSON.stringify(saved));
    
    cancelEdit();
    loadSavedFruits();
}

function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editQuantity').value = '1';
    localStorage.removeItem('editingIndex');
}

function deleteFruit(index) {
    let saved = JSON.parse(localStorage.getItem('myFruits'));
    saved.splice(index, 1);
    localStorage.setItem('myFruits', JSON.stringify(saved));
    loadSavedFruits();
}

function updateStats(saved, totalCal, totalSugar) {
    if (saved.length === 0) {
        document.getElementById('totalItems').textContent = '0';
        document.getElementById('totalCalories').textContent = '0';
        document.getElementById('avgCalories').textContent = '0';
        document.getElementById('totalSugar').textContent = '0g';
        return;
    }
    
    const avg = (totalCal / saved.length).toFixed(1);
    
    document.getElementById('totalItems').textContent = saved.length;
    document.getElementById('totalCalories').textContent = totalCal;
    document.getElementById('avgCalories').textContent = avg;
    document.getElementById('totalSugar').textContent = totalSugar.toFixed(1) + 'g';
}

window.showPage = showPage;
window.getFruitData = getFruitData;
window.saveFruit = saveFruit;
window.loadSavedFruits = loadSavedFruits;
window.showEditForm = showEditForm;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;
window.deleteFruit = deleteFruit;
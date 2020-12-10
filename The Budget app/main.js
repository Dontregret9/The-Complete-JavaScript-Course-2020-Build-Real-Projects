// Notes:
    // This JavaScript file was written in ES5, so I used some patterns as IIFE, without 'class' keyword...
    // Use "" in HTML/CSS code and '' in JS code


// Budget controller  ---> (Data)
var budgetController = (function (){

    // Use class to work with data easily
    // This constructor, structure, 'shape' of data
    var Expense = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // This is the real place to store data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: [],
            inc: []
        },
        budget: 0
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

    // everything we want to call from this component
    return {
        // database need update when user create or delete an element
        addItem: function (type, des, val) {
            var newItem, ID;

            // create ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else{
                ID = 0;
            }

            // create new item base on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID,des,val);
            } else if (type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            // push to data structure
            data.allItems[type].push(newItem);
            // after push to database, return item for another purposes
            return newItem

        },
        // not understanded yet
        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        // when add/del an element, we have to update all other info
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
        },
        //user can see the result but can't see what happen behind the scene
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            };
        }
    };
})();

// UI controller    ---> (manipulate UI)
var UIController = (function (){
    // In this component, we should store all className, Id of elements that we need to work with
    // because we can change it easily to sync it with HTML code
    // We can store them like CSS selector and easily use with querySelector
    // In this case, I just use Id, so I can use them by getElementById - this way may be faster than querySelector (runtime)
    var DOMstrings = {
        inputType: 'type',
        chooseType: 'choose-type',
        typeInc: 'choose-inc',
        typeExp: 'choose-exp',
        inputDescription: 'description-input',
        inputValue: 'value-input',
        inputBtn: 'add',
        incomeContainer:  'income-list',
        expenseContainer: 'expense-list',
        budgetLabel: 'budget',
        incomeLabel: 'inc-amount',
        expenseLabel: 'exp-amount',
        container: 'detail-info'
    };

    return {
        // get all input attribute
        getInput: function () {
            return {
                type: document.getElementById(DOMstrings.inputType).textContent,
                description: document.getElementById(DOMstrings.inputDescription).value,
                value: parseFloat(document.getElementById(DOMstrings.inputValue).value)
            };
        },
        // input: type: inc/exp; obj: item need to add/del
        addListItem: function (obj, type){
            var html, newHTML, element;
            // create HTML string with placehodel text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                // copy our item HTML code, add some weird string (%id%) to easily identify for replace latterly
                html = '<div class="detail-item" id="inc-%id%"><span class="description">%description%</span><div class="right-detai"><span class="amount">%value%</span><input id="inc-del-1" type="button" value="X"></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="detail-item" id="exp-%id%"><span class="description">%description%</span><div class="right-detai"><span class="amount">%value%</span><input id="exp-del-1" type="button" value="X"></div></div>';
            }

            // replace the placeholder text with actual data
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", obj.value);

            // insert the HTML into DOM
            document.getElementById(element).insertAdjacentHTML('beforeend', newHTML);
        },
        deleteListItem: function (selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        // after add an element completed, we have to clear input box
        clearFields: function(){
            var fields, fieldsArr;

            // fields is a list
            fields = document.querySelectorAll('#'+DOMstrings.inputDescription+', #'+DOMstrings.inputValue);

            // use method slide of array to convert list to array
            fieldsArr = Array.prototype.slice.call(fields);

            // use forEach method of array to set value of elements to ''
            fieldsArr.forEach(function(current){
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        // after update database, we have to show them
        displayBudget: function(obj){
            document.getElementById(DOMstrings.budgetLabel).textContent = obj.budget;
            document.getElementById(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.getElementById(DOMstrings.expenseLabel).textContent = obj.totalExp;
        },
        // return DOM selector for other components use them
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();


// Control all component  ---> global controller
// input parameters are all components before
var controller = (function (budgetCtrl, UICtrl) {
    
    // all events will be capture in here 
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        var curType = 'inc';

        document.getElementById(DOM.inputType).addEventListener('click', function(){
            document.getElementsByClassName(DOM.chooseType)[0].style.display = 'flex';

            //prepare for type chosen
            document.getElementById(DOM.typeExp).addEventListener('click',function(){
                document.querySelector("#"+DOM.typeExp+">i").style.opacity = 1;
                document.querySelector("#"+DOM.typeInc+">i").style.opacity = 0;
                curType = 'exp';
            });
            document.getElementById(DOM.typeInc).addEventListener('click',function(){
                document.querySelector("#"+DOM.typeInc+">i").style.opacity = 1; 
                document.querySelector("#"+DOM.typeExp+">i").style.opacity = 0;
                curType = 'inc';
            });

            window.addEventListener('click',function(event){
                if(event.target == document.getElementsByClassName(DOM.chooseType)[0])
                {
                    event.target.style.display = 'none';
                }
                document.getElementById(DOM.inputType).value = curType;
            })
        });

        document.getElementById(DOM.inputBtn).addEventListener('click', function(){
            ctrlAddItem();
        });

        document.addEventListener('keypress', function (event){
            if (event.keyCode === 13 || event.which === 13)// event.which for old browser
            {
                ctrlAddItem();
            }
        });

        document.getElementById(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    // all tasks we need to update budget
    var updateBudget = function (){
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. display the budget
        UICtrl.displayBudget(budget);
        console.log("Updated budget !");
    };
    // all tasks we need to add an item 
    var ctrlAddItem = function (event){
        var input, newItem;

        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            updateBudget();
        }
    };

    // all tasks we need to delete an item
    var ctrlDeleteItem = function (event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // del item from database
            budgetCtrl.deleteItem(type,ID);

            //del item on UI
            UICtrl.deleteListItem(itemID);

            updateBudget();
        }
    };

    // return init method to start web app
    return {
        init: function () {
            console.log("Application has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();
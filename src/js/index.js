import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements,renderLoader,clearLoader} from './views/base';
/*
 Global state state of the app
 * search object 
 * current recipe object 
 * shoping list object liked recipes
*/

//
// Recipe Controler
// 

const state ={};

const controlSearch = async ()=>{

  // 1) Get query from view
  const query =searchView.getInput(); //todo
  
  if(query){
    // 2) search object and add to the state
    state.search=new Search(query);

    //3) prepare UI for the results
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);
    try{
        //4) search for recipes
    await state.search.getResults();

    //5) renders results on UI
    clearLoader();
    searchView.renderResults(state.search.result);
    }
    catch(e){
      alert(e);
    }
  }
}
elements.searchForm.addEventListener('submit',e=>{
  e.preventDefault();
  controlSearch();
});


elements.searchResPages.addEventListener('click',e=>{
  const btn =e.target.closest('.btn-inline');

  if(btn){
    const goToPage=parseInt(btn.dataset.goto,10);
   // c//onsole.log(goToPage);
   searchView.clearResult();
    searchView.renderResults(state.search.result,goToPage);
  }
})


//
// Recipe COntroller
//


const controlRecipe =async ()=>{
const id =window.location.hash.replace('#','');

if(id){
  // prepare ui for changes
  recipeView.clearRecipe();
   renderLoader(elements.recipe);


   //highlightes selected items
   if(state.search) searchView.highlightSelected(id);


  // create new recipe object
  state.recipe = new Recipe(id);


  
  try{
    //get recipe data and parse ingedients
    await state.recipe.getRecipe();
  
    state.recipe.parseIngredients();
    //calculate serving time 
    state.recipe.calcTime();
    state.recipe.calcServings();
    // render recipe
   
    clearLoader();
    recipeView.renderRecipe(state.recipe,
      state.likes.isLiked(id)
      );
  }
  catch(e){
    alert(e);
  }
   
}
}


['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));



//
// LIst COntroller
//

const controlList =()=>{
  // create a mew list if there is none yet

  if(!state.list) state.list= new List();

  //add each ingredient to the list and UI 
  state.recipe.ingredients.forEach(el =>{
     const item = state.list.addItem(el.count , el.unit , el.ingredient);
        
     listView.renderItem(item); 
  });
};


//
// LIke COntroller
//

//testing 

const controlLike =()=>{
  if(!state.likes) state.likes=new Likes();
  const currentId=state.recipe.id;

  //user has not yet liked
  if(!state.likes.isLiked(currentId)){
    // add like to the state  
   
     const newLike=state.likes.addLike(
       currentId,
        state.recipe.title,
        state.recipe.author,
        state.recipe.img
     )
    // toggle the like button 
    likesView.toggleLikeBtn(true);

    // add likes to the UI list 
    likesView.renderLike(newLike);

    
 //user has liked  

  }else{
     // remove like to the state  
        state.likes.deleteLike(currentId);
    // remove the like button 
        likesView.toggleLikeBtn(false);
    // remove likes to the UI list 
        likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// restore recipe like while page loading
window.addEventListener('load',()=>{
  state.likes=new Likes() ;

  //restore likes
  state.likes.readStorage();

  // toggle like button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // render the existing likes
  state.likes.likes.forEach(like=>likesView.renderLike(like))

});


// handle delete and update list 
elements.shopping.addEventListener('click',e=>{
  const id = e.target.closest('.shopping__item').dataset.itemid;
  
  // handle delete
  if(e.target.matches('.shopping__delete, .shopping__delete *')){
    // delete from state
    state.list.deleteItem(id);
   
    // delete from view
    listView.deleteItem(id);
  }else if(e.target.matches('.shopping__count-value')){
    const val=parseFloat(e.target.value,10);
    state.list.updateCount(id,val);
  }

})



// handeling recipe button clicks

elements.recipe.addEventListener('click',e=>{
  if(e.target.matches('.btn-decrease, .btn-decrease *')){
   // decrease button is clicked
   if(state.recipe.servings>1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
   }
  }else if(e.target.matches('.btn-increase, .btn-increase *')){
    // dincrease button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
   }else if(e.target.matches('.recipe__btn--add , .recipe__btn--add *')){
   
     controlList();
   }else if(e.target.matches('.recipe__love, .recipe__love *')){
     
     controlLike();
   }
  
  });

import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';  
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
// import { async } from 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);


    if (!id) return;
    // update result view to mark selected search result
    recipeView.renderSpinner();

    // update results view mark selected search result
    resultsView.update(model.getSearchResultsPage());
    
    // updating bookmarks view
    bookmarksView.update(model.state.bookmarks); 
    
    // Loading
    await model.loadRecipe(id);

    // Rendering
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(); 
  }
}

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    
    // get search query
    const query = searchView.getQuery();
    if (!query) return;

    // get data from param query
    await model.loadSearchResults(query);

    // console.log("state",model.state);
    // render results
    resultsView.render(model.getSearchResultsPage());
    
    // render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    return err;
  }
}

const controlPagination = function (goToPage){
    // render results
    resultsView.render(model.getSearchResultsPage(goToPage));
    
    // render new pagination
    paginationView.render(model.state.search);
}

const controlServings = function(newServings){
  // Update the recipe servings (in state)
  model.updateServings(newServings);


  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function(){
  // add/remove bookmarks
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmark = function (){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe){
  // console.log(newRecipe);
  try {
    addRecipeView.renderSpinner();

    // upload the new recipe data
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null,'',`#${model.state.recipe.id}`);
    // windows.history.back()

    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC *1000)

  } catch (err) {
    addRecipeView.renderError(err.message);
  }

}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings); 
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('welcome');
}

init();
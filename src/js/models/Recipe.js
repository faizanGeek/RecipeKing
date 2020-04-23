import axios from 'axios';
import {key,proxy} from '../config';
export default class Recipe{
    constructor(id){
        this.id=id;
       }
    async getRecipe(id){
      try{
        const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
         this.title= res.data.recipe.title;
         this.author= res.data.recipe.publisher;
         this.img= res.data.recipe.image_url;
         this.url= res.data.recipe.source_url;
         this.ingredients= res.data.recipe.ingredients;
        //this.result=res.data.recipes;
       
        }
        catch(error){
            alert(error);
        }
    }
    calcTime() {
        // assume that we need 14 mint for each 3 ingredientrs
        const numIng =this.ingredients.length;
        const periods= Math.ceil(numIng/3);
        this.time=periods*15;
    }
    calcServings(){
        this.servings =4;

    }
    parseIngredients(){
        const unitsLong =['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitsShort=['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units =[...unitsShort , 'kg' ,'g']
        const newIngredients = this.ingredients.map(el=>{
            //uniform units
            let ingredient =el.toLowerCase();
             unitsLong.forEach((unit,i)=>{
             ingredient=ingredient.replace(unit,units[i]);
             });
            //remove paranthesis
            ingredient=ingredient.replace(/ *\([^)]*\) */g, " ");

            // parse ingredients into counts , units 
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2=>unitsShort.includes(el2));
           let objIng;
            if(unitIndex>-1){
                // there is unit
                //ex 4 1/2 cups . arrCount = [4,1/2]
                // ex 4 cups, arrCount =[4]
                const arrCount =arrIng.slice(0,unitIndex);
                let count;
                if(arrCount.length===1){
                    count = eval(arrIng[0].replace('-','+'));
                   //count=5
                }
                else{
                    count =eval(arrIng.slice(0,unitIndex).join('+'));
                }
                objIng={
                    count :count,
                    unit : arrIng[unitIndex],
                    ingredient : arrIng.slice(unitIndex+1).join(' ')
                };
            }else if(parseInt(arrIng[0],10)){
                // there is not unut but there is number
                objIng={
                    count:parseInt(arrIng[0],10),
                    unit : '',
                    ingredient:arrIng.slice(1).join(' ')
                }
            } else if(unitIndex===-1){
                // there is no unit
                objIng={
                    count:1,
                    unit : '',
                    ingredient 
                }
            }

            return objIng;
        });
        this.ingredients =newIngredients;
     }
     updateServings(type){
         // servings 
         const newServings = type==='dec' ? this.servings-1:this.servings+1;
         
         //ingredients
         this.ingredients.forEach(ing =>{
             ing.count=ing.count*(newServings/this.servings);
         })
        

         this.servings=newServings;
     }
}

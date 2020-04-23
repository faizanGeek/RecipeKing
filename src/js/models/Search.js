import axios from 'axios';
import {key,proxy} from '../config';
export default class{
    constructor(query){
        this.query=query
       }
    async getResults(query){
      try{
        const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
      
        this.result=res.data.recipes;
       // console.log(this.result);
        }
        catch(error){
            alert(error);
        }
    }
    
}

//getResults('pizza');
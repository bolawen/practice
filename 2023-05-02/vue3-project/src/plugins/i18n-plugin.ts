export default{
    install(app: any,options: {[key:string]: string}){
        app.config.globalProperties.lang = (key:string)=>{
            return options[key];
        }   
    }
}
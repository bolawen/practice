export default (eventName: any, container: any, value: any)=>{
    container.dispatchEvent(new CustomEvent(eventName,{
        detail: { value }
    }));
}
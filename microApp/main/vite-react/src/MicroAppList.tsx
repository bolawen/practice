function MicroAppList(){
    return <div>
        <micro-app 
            name='vite-react-micro-app' 
            url='http://localhost:5174/' 
            baseroute='/micro-app-list/'
            inline
            disableSandbox
        ></micro-app>
    </div>
}

export default MicroAppList;
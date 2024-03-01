type AppProps = {
  data?: { [key: string]: string};
}

function App(props: AppProps) {
  const { data } = props;

  const handleClick = ()=>{
    console.log("data", data);
  }

  return (
    <div>
      <h3>Hello World</h3>
      <div onClick={ handleClick }>打开新世界</div>
    </div>
  );
}

export default App;

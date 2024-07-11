import TextContainerOfLineClamp from "./components/TextContainerOfLineClamp/TextContainerOfLineClamp";

function App() {
  const longText = `
    <p>理发店就发了肯德基离开了</p>
    <p>发了第三方考虑弹尽粮绝发</p>
    <p>发的酸辣粉就到了发发了大开发来的开始减肥领导</p>
    <p>发的酸辣粉就到了发发了大开</p>
  `;

  const shortText = `
    <p>发了第三方考虑弹尽粮绝发</p>
    <p>理发店就发了肯德基离开了</p>
  `;

  return (
    <div>
      <h3>超过三行显示 展开按钮 (bottom)</h3>
      <TextContainerOfLineClamp
        text={<div dangerouslySetInnerHTML={{ __html: longText }} />}
        maxLines={3}
      />
      <h3>未超过三行显示 展开按钮 (bottom)</h3>
      <TextContainerOfLineClamp
        text={<div dangerouslySetInnerHTML={{ __html: shortText }} />}
        maxLines={3}
      />
      <h3>超过三行显示 展开按钮 (rightBottom)</h3>
      <TextContainerOfLineClamp
        text={<div dangerouslySetInnerHTML={{ __html: longText }} />}
        maxLines={3}
      />
    </div>
  );
}

export default App;

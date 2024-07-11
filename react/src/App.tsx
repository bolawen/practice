import TextContainerOfLineClamp from "./components/TextContainerOfLineClamp/TextContainerOfLineClamp";

function App() {
  const text1 = `
  <div>
    <p style="color: red; font-size: 24px;">Through perseverance and passion, </p>
    <div>岁月如歌，静待花开；心若初见，岁月静好。</div>
    <div style="font-weight: bolder;">在春风拂面的时光里，阳光温柔地洒在林荫小径上，如诗如画，让人心驰神往。</div>
  </div>
  `;

  const text2 = `
  <div>
    <p style="color: red">Through perseverance.</p>
    <div>岁月如歌，静待花开；心若初见，岁月静好。</div>
  </div>
  `;

  const text3 =
    "Through perseverance and passion,岁月如歌，静待花开；心若初见，岁月静好。在春风拂面的时光里，阳光温柔地洒在林荫小径上，如诗如画";

  return (
    <div>
      <h3>超过三行显示 展开 按钮</h3>
      <TextContainerOfLineClamp
        maxLines={3}
        width="300px"
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      >
        <div dangerouslySetInnerHTML={{ __html: text1 }} />
      </TextContainerOfLineClamp>
      <h3>未超过三行不显示 展开 按钮</h3>
      <TextContainerOfLineClamp
        maxLines={3}
        width="300px"
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      >
        <div dangerouslySetInnerHTML={{ __html: text2 }} />
      </TextContainerOfLineClamp>
      <h3>纯文本超出三行显示展开按钮</h3>
      <TextContainerOfLineClamp
        text={text3}
        maxLines={3}
        width="300px"
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      ></TextContainerOfLineClamp>
      <h3>超过三行显示 展开 按钮，底部位置</h3>
      <TextContainerOfLineClamp
        maxLines={3}
        width="300px"
        singleMode={true}
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      >
        <div dangerouslySetInnerHTML={{ __html: text1 }} />
      </TextContainerOfLineClamp>

      <h3>超过三行显示 展开 按钮，底部位置</h3>
      <TextContainerOfLineClamp
        maxLines={3}
        width="300px"
        singleMode={true}
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      >
        <div dangerouslySetInnerHTML={{ __html: text2 }} />
      </TextContainerOfLineClamp>

      <h3>超过三行显示 展开 按钮, 仅显示展开按钮</h3>
      <TextContainerOfLineClamp
        maxLines={3}
        width="300px"
        onlyShowExpand={true}
        expandNode={<span>展开按钮</span>}
        collapseNode={<span>收起按钮</span>}
      >
        <div dangerouslySetInnerHTML={{ __html: text1 }} />
      </TextContainerOfLineClamp>
    </div>
  );
}

export default App;

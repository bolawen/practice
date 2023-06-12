import "./menu.scss";
import RcMenu, { Item as RcMenuItem, Divider as RcDivider } from "rc-menu";

function Menu() {
  const onSelect = ({ key }: any) => {
    console.log(`${key} selected`);
  };
  return (
    <RcMenu onSelect={onSelect}>
      <RcMenuItem key="1">one</RcMenuItem>
      <RcDivider />
      <RcMenuItem key="2">two</RcMenuItem>
      <RcMenuItem key="3">three</RcMenuItem>
      <RcMenuItem key="4">four</RcMenuItem>
    </RcMenu>
  );
}

export default Menu;

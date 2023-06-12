import "./dropdown.scss";
import RcDropdown from "rc-dropdown";
import RcMenu, { Item as MenuItem, Divider } from "rc-menu";

function Dropdown() {
  const onSelect = ({ key }: any) => {
    console.log(`${key} selected`);
  };

  const onVisibleChange = (visible: boolean) => {
    console.log(visible);
  };

  const renderMenu = (
    <RcMenu onSelect={onSelect}>
      <MenuItem key="1">one</MenuItem>
      <Divider />
      <MenuItem key="2">two</MenuItem>
      <MenuItem key="3">three</MenuItem>
      <MenuItem key="4">four</MenuItem>
    </RcMenu>
  );

  return (
    <RcDropdown
      trigger={["click"]}
      overlay={renderMenu}
      animation="slide-up"
      onVisibleChange={onVisibleChange}
    >
      <button style={{ width: 100 }}>open</button>
    </RcDropdown>
  );
}

export default Dropdown;

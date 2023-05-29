import { useImmer } from "use-immer";

function App() {
  const [form, setForm] = useImmer({
    id: 0,
    title: "哈哈哈",
    desc: "发多少开发都说了",
    isEdit: false,
  });

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setForm((draft) => {
      draft.desc = value;
    });
  };

  const handleFormEdit = () => {
    setForm((draft) => {
      draft.isEdit = !form.isEdit;
    });
  };

  return (
    <div>
      <h3>{form.title}</h3>
      {form.isEdit ? (
        <input value={form.desc} onChange={handleInputChange}></input>
      ) : (
        <p>{form.desc}</p>
      )}

      <button onClick={handleFormEdit}>编辑</button>
    </div>
  );
}

export default App;

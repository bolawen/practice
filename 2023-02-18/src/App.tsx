import React, {useEffect, useRef, useState} from 'react';

interface FormFieldType {
    name: string;
    age: number;
}
interface FormRefType {
    getFieldsValue?: () => FormFieldType;
    validateFields?: () => boolean;
}
interface FormPropsType {
    formRef: React.MutableRefObject<FormRefType>;
}

function Form(props: FormPropsType) {
    const {formRef} = props;

    const [name, setName] = useState('');
    const [age, setAge] = useState(0);

    const onChangeField = (e: {target: {value: any}}, key: string) => {
        const {value} = e.target;
        if (key === 'name') {
            setName(value);
        } else if (key === 'age') {
            setAge(value);
        }
    };
    const getFieldsValue = () => {
        return {
            name,
            age,
        };
    };
    const validateFields = () => {
        if (!name) {
            return false;
        }
        if (!age) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        formRef.current.getFieldsValue = getFieldsValue;
        formRef.current.validateFields = validateFields;
    }, [name, age]);

    return (
        <div>
            <div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onChangeField(e, 'name')}
                />
            </div>
            <div>
                <input
                    type="text"
                    value={age}
                    onChange={(e) => onChangeField(e, 'age')}
                />
            </div>
        </div>
    );
}

function App() {
    const formRef = useRef<FormRefType>({
        getFieldsValue: undefined,
        validateFields: undefined,
    });
    const onSubmit = () => {
        const result = formRef.current.validateFields?.();
        console.log(result);
        if (result) {
            console.log(formRef.current.getFieldsValue?.());
        }
    };

    return (
        <div className="App">
            <Form formRef={formRef} />
            <div>
                <button onClick={onSubmit}>提交</button>
            </div>
        </div>
    );
}

export default App;

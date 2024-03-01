import './input.scss';
import React, { memo, useRef } from 'react';

export enum LimitType {
  Text = 'text', // 按文本长度计算字数
  Character = 'character' // 按字符数计算字数
}

export interface InputProps {
  value: string;
  type?: string;
  error?: string;
  limit?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  limitType?: LimitType; 
  limitTextColor?: string;
  limitActiveTextColor?: string;
  onChange: (value: string, len: number) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const getCharacterTextLength = (text: string) => {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      length += 0.5;
    } else {
      length += 1;
    }
  }
  return length;
};

export const Input = memo(function Input(props: InputProps) {
  const {
    value,
    limit,
    error,
    onChange,
    type = 'text',
    disabled = false,
    className = '',
    placeholder = '',
    limitTextColor = '#666',
    limitType = LimitType.Text,
    limitActiveTextColor = '#dd4e40'
  } = props;
  const isComposing = useRef(false);

  const getTextLength = (v: string) => {
    const text = v.trim();
    if (limitType === LimitType.Text) {
      return text.length;
    }
    return getCharacterTextLength(text);
  };

  const getLimitText = (text: string, limit = Infinity) => {
    let length = 0;
    let result = '';
    if (limitType === LimitType.Text) {
      length = text.length;
      result = text.substring(0, limit);
    } else {
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
          length += 0.5;
        } else {
          length += 1;
        }
        if (length > limit) {
          break;
        }
        result += text[i];
      }
    }
    return { result, length };
  };

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!limit) {
      onChange(e.target.value, getTextLength(e.target.value));
      return;
    }
    const limitResult = getLimitText(e.target.value, limit);
    let text = e.target.value;
    if (!isComposing.current) {
      text = limitResult.result;
    }
    onChange(text, limitResult.length);
  };

  const onCompositionEnd = () => {
    isComposing.current = false;
    if (!!limit) {
      const { result, length } = getLimitText(value, limit);
      onChange(result, length);
    }
  };

  const renderMessageOfLimit = () => {
    if (limit == undefined) {
      return null;
    }

    const textLength = Math.min(Math.floor(getTextLength(value)),limit);

    return (
      <div
        className="bolawen-input__message__limit"
        style={{ color: limitTextColor }}
      >
        <span
          style={{
            color:
              textLength === limit ? limitActiveTextColor : limitTextColor
          }}
        >
          {textLength}
        </span>
        /{limit}
      </div>
    );
  };

  const renderMessage = () => {
    if (!error && !limit) {
      return null;
    }
    return (
      <div className="bolawen-input__message">
        <div className="bolawen-input__message__error">{error}</div>
        {renderMessageOfLimit()}
      </div>
    );
  };

  return (
    <div className={`bolawen-input ${className}`}>
      <input
        className="bolawen-input__input"
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onChange={onValueChange}
        onCompositionEnd={onCompositionEnd}
        onCompositionStart={() => (isComposing.current = true)}
      />
      {renderMessage()}
    </div>
  );
})
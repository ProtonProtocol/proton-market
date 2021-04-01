import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import Tooltip from '../Tooltip';
import { InputContainer, Input, ErrorMessage } from './TextInput.styled';

type Props = {
  inputType: string;
  text: string;
  placeholder: string;
  setText: Dispatch<SetStateAction<string>>;
  checkIfIsValid: (
    text: string
  ) => {
    isValid: boolean;
    errorMessage: string;
  };
  submit?: () => Promise<void>;
  tooltip?: string;
  numberOfTooltipLines?: number;
  halfWidth?: boolean;
  mr?: string;
  ml?: string;
};

const TextInput = ({
  inputType,
  text,
  placeholder,
  setText,
  checkIfIsValid,
  submit,
  tooltip,
  numberOfTooltipLines,
  halfWidth,
  mr,
  ml,
}: Props): JSX.Element => {
  const [error, setError] = useState<string>('');

  const updateText = (e: ChangeEvent<HTMLInputElement>) => {
    const textInput = e.target.value;
    setError('');
    setText(textInput);

    const { isValid, errorMessage } = checkIfIsValid(textInput);
    if (!isValid) {
      setError(errorMessage);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  return (
    <InputContainer halfWidth={halfWidth} mr={mr} ml={ml} hasError={!!error}>
      <Input
        required
        type={inputType}
        placeholder={placeholder}
        value={text}
        onChange={updateText}
        onKeyDown={submit ? handleKeyDown : null}
      />
      {tooltip ? (
        <Tooltip text={tooltip} numberOfLines={numberOfTooltipLines} />
      ) : null}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </InputContainer>
  );
};

TextInput.defaultProps = {
  halfWidth: false,
  inputType: 'text',
  checkIfIsValid: () => ({
    isValid: true,
    errorMessage: '',
  }),
};

export default TextInput;

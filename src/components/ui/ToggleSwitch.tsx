import { Switch } from 'react-native';

interface ToggleSwitchProps { value: boolean; onValueChange: (v: boolean) => void; }
export function ToggleSwitch({ value, onValueChange }: ToggleSwitchProps) {
  return <Switch value={value} onValueChange={onValueChange} />;
}

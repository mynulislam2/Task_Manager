declare module '@react-native-community/datetimepicker' {
  import React from 'react';

  type DateTimePickerEvent = {
    type: 'set' | 'dismissed';
    nativeEvent: {
      timestamp: number;
    };
  };

  interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
  }

  const DateTimePicker: React.FC<DateTimePickerProps>;
  export default DateTimePicker;
}

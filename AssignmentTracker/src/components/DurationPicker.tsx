import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { colors } from '../utils/colors';

const HOURS = Array.from({ length: 13 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const ITEM_HEIGHT = 44;

interface DurationPickerProps {
  value: number;
  onChange: (minutes: number) => void;
}

const formatDurationDisplay = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`;
  return h === 1 ? `1 hr ${m} min` : `${h} hrs ${m} min`;
};

export const DurationPicker: React.FC<DurationPickerProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [selectedHours, setSelectedHours] = useState(Math.floor(value / 60));
  const [selectedMinutes, setSelectedMinutes] = useState(value % 60);

  const hoursRef = useRef<FlatList<any>>(null);
  const minutesRef = useRef<FlatList<any>>(null);

  const handleOpen = useCallback(() => {
    setSelectedHours(Math.floor(value / 60));
    setSelectedMinutes(value % 60);
    setVisible(true);
  }, [value]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        const hoursIndex = HOURS.indexOf(Math.floor(value / 60));
        const minutesIndex = MINUTES.indexOf(value % 60);

        if (hoursIndex >= 0) {
          hoursRef.current?.scrollToIndex({ index: hoursIndex, animated: false, viewPosition: 0.5 });
        }
        if (minutesIndex >= 0) {
          minutesRef.current?.scrollToIndex({ index: minutesIndex, animated: false, viewPosition: 0.5 });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, value]);

  const handleConfirm = useCallback(() => {
    onChange(selectedHours * 60 + selectedMinutes);
    setVisible(false);
  }, [onChange, selectedHours, selectedMinutes]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  const handleMomentumEnd = useCallback(
    (offsetY: number, data: number[], onSelect: (v: number) => void) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      onSelect(data[clampedIndex]);
    },
    [],
  );

  const renderColumn = (
    data: number[],
    selectedValue: number,
    onSelect: (v: number) => void,
    ref: React.MutableRefObject<FlatList<any> | null>,
  ) => (
    <View style={styles.columnWrapper}>
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(item) => String(item)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text
              style={[
                styles.itemText,
                item === selectedValue && styles.itemTextSelected,
              ]}
            >
              {item}
            </Text>
          </View>
        )}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        onMomentumScrollEnd={(e) =>
          handleMomentumEnd(e.nativeEvent.contentOffset.y, data, onSelect)
        }
      />
    </View>
  );

  return (
    <>
      <TouchableOpacity onPress={handleOpen} style={styles.trigger} activeOpacity={0.7}>
        <Text style={styles.triggerText}>
          {formatDurationDisplay(value)}
        </Text>
        <Text style={styles.triggerIcon}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel}>
          <View style={styles.sheet}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>length of assignment</Text>
              </View>

              <View style={styles.columnsContainer}>
                <View style={styles.column}>
                  <Text style={styles.columnLabel}>hr</Text>
                  {renderColumn(HOURS, selectedHours, setSelectedHours, hoursRef)}
                </View>

                <Text style={styles.colon}>:</Text>

                <View style={styles.column}>
                  <Text style={styles.columnLabel}>min</Text>
                  {renderColumn(MINUTES, selectedMinutes, setSelectedMinutes, minutesRef)}
                </View>
              </View>

              <View style={styles.preview}>
                <Text style={styles.previewText}>
                  {formatDurationDisplay(selectedHours * 60 + selectedMinutes)}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerText: {
    fontSize: 16,
    color: colors.text,
  },
  triggerIcon: {
    fontSize: 18,
    color: colors.textLight,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'lowercase',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  column: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  columnWrapper: {
    width: 80,
    height: ITEM_HEIGHT * 5,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  colon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 12,
    marginTop: 24,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: colors.textLight,
  },
  itemTextSelected: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});

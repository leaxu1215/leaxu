import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const COLORS = {
  dark: '#2d2d2d',
  blue: '#118ab2',
  orange: '#ff6b35',
  yellow: '#ffd166',
  cream: '#f5f0e8',
  creamDark: '#e8e2d6',
  pink: '#ffb4b4',
  white: '#ffffff',
};

const Cell = ({
  value,
  notes = new Set(),
  isGiven = false,
  isSelected = false,
  isHighlighted = false,
  isSameNumber = false,
  isError = false,
  isHintTarget = false,
  isHintReason = false,
  row,
  col,
  onPress,
  size = 38,
}) => {
  // Determine background color based on priority
  const getBackgroundColor = () => {
    if (isSelected) return COLORS.yellow;
    if (isHintTarget) return '#e8f5e9';
    if (isHintReason) return '#e3f2fd';
    if (isError) return COLORS.pink;
    if (isSameNumber) return '#ffe4a0';
    if (isHighlighted) return '#f0e8d0';
    return COLORS.white;
  };

  // Determine text color based on state
  const getTextColor = () => {
    if (isError) return COLORS.orange;
    if (isGiven) return COLORS.dark;
    return COLORS.blue;
  };

  // Determine font weight
  const getFontWeight = () => {
    return isGiven ? 'bold' : 'normal';
  };

  // Determine border styles
  const getBorderStyles = () => {
    const styles = {};

    // Top border
    if (row % 3 === 0) {
      styles.borderTopWidth = 2;
      styles.borderTopColor = COLORS.dark;
    } else {
      styles.borderTopWidth = 0.5;
      styles.borderTopColor = '#ccc';
    }

    // Left border
    if (col % 3 === 0) {
      styles.borderLeftWidth = 2;
      styles.borderLeftColor = COLORS.dark;
    } else {
      styles.borderLeftWidth = 0.5;
      styles.borderLeftColor = '#ccc';
    }

    // Right border (on last column of each box or last column)
    if (col === 8) {
      styles.borderRightWidth = 2;
      styles.borderRightColor = COLORS.dark;
    }

    // Bottom border (on last row of each box or last row)
    if (row === 8) {
      styles.borderBottomWidth = 2;
      styles.borderBottomColor = COLORS.dark;
    }

    return styles;
  };

  // Render notes in 3x3 grid
  const renderNotes = () => {
    const noteSize = size / 5;
    const notesArray = Array.from(notes).sort((a, b) => a - b);

    return (
      <View style={styles.notesContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <View
            key={num}
            style={[
              styles.noteCell,
              { width: size / 3, height: size / 3 }
            ]}
          >
            {notesArray.includes(num) && (
              <Text style={[styles.noteText, { fontSize: noteSize }]}>
                {num}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Pressable
      onPress={() => onPress && onPress(row, col)}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: getBackgroundColor(),
        },
        getBorderStyles(),
      ]}
    >
      {value ? (
        <Text
          style={[
            styles.valueText,
            {
              fontSize: size * 0.55,
              color: getTextColor(),
              fontWeight: getFontWeight(),
            },
          ]}
        >
          {value}
        </Text>
      ) : (
        notes.size > 0 && renderNotes()
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    textAlign: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  noteCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    color: COLORS.dark,
    textAlign: 'center',
  },
});

export default Cell;

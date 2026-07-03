import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, useColorScheme } from 'react-native';
import { ChevronDown, ChevronUp, Search, Check } from 'lucide-react-native';
import { useAppStore } from '../store';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface SearchableDropdownProps {
  items: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const SearchableDropdown = ({ items, selectedId, onSelect, placeholder, disabled }: SearchableDropdownProps) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const selectedItem = items.find(i => (i.id || i) === selectedId);
  const selectedLabel = selectedItem ? (selectedItem.label || selectedItem.id || selectedItem) : '';

  const filteredItems = items.filter(i => {
    const label = (i.label || i.id || i).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[styles.dropdownHeader, disabled && styles.dropdownHeaderDisabled]} 
        onPress={() => !disabled && setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownHeaderText, !selectedId && { color: theme.textSecondary }]}>
          {selectedId ? selectedLabel : placeholder}
        </Text>
        {expanded ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>

      {expanded && !disabled && (
        <View style={styles.dropdownBody}>
          <View style={styles.searchRow}>
            <Search size={16} color={theme.textSecondary} />
            <TextInput 
              style={styles.searchInput}
              placeholder="SEARCH..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {filteredItems.map(item => {
              const id = item.id || item;
              const label = item.label || id;
              const isSelected = selectedId === id;
              return (
                <TouchableOpacity 
                  key={id}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                  onPress={() => {
                    onSelect(id);
                    setExpanded(false);
                    setSearch('');
                  }}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                    {label}
                  </Text>
                  {isSelected && <Check size={16} color={theme.primaryText} />}
                </TouchableOpacity>
              );
            })}
            {filteredItems.length === 0 && (
              <Text style={styles.noResultsText}>NO RESULTS FOUND</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

interface SchemaDropdownProps {
  onSelect?: (domainId: string, mocId: string) => void;
}

export const SchemaDropdown = ({ onSelect }: SchemaDropdownProps) => {
  const { schema, isSchemaLoading, schemaError, loadSchema } = useAppStore();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedMocId, setSelectedMocId] = useState<string>('');
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedDomainId, selectedMocId);
    }
  }, [selectedDomainId, selectedMocId]);

  if (isSchemaLoading) {
    return <Text style={styles.loadingText}>LOADING SCHEMA...</Text>;
  }

  if (schemaError || !schema) {
    return (
      <View style={styles.errorContainer}>
        <Text style={schemaError ? styles.errorText : styles.loadingText}>
          {schemaError ? `ERROR: ${schemaError}` : 'SCHEMA NOT LOADED.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSchema}>
          <Text style={styles.retryButtonText}>{schemaError ? 'RETRY LOAD' : 'LOAD SCHEMA'}</Text>
        </TouchableOpacity>

      </View>
    );
  }

  const domains = schema.domains || [];
  const selectedDomainObj = domains.find((d: any) => d.id === selectedDomainId);
  const mocs = selectedDomainObj?.mocs || [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DOMAIN</Text>
      <SearchableDropdown 
        items={domains}
        selectedId={selectedDomainId}
        onSelect={(id) => {
          setSelectedDomainId(id);
          setSelectedMocId(''); // reset MOC when domain changes
        }}
        placeholder="SELECT A DOMAIN..."
      />

      <Text style={styles.label}>MOC</Text>
      <SearchableDropdown 
        items={mocs}
        selectedId={selectedMocId}
        onSelect={setSelectedMocId}
        placeholder={selectedDomainId ? "SELECT A MOC..." : "SELECT A DOMAIN FIRST"}
        disabled={!selectedDomainId}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.display,
    color: theme.text,
    marginBottom: Spacing.one,
    marginTop: Spacing.half,
    letterSpacing: 0.5,
  },
  dropdownContainer: {
    marginBottom: Spacing.two,
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.oneHalf,
  },
  dropdownHeaderDisabled: {
    backgroundColor: theme.background,
    opacity: 0.5,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: theme.text,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
  },
  dropdownBody: {
    marginTop: Spacing.one,
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.backgroundElement,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    fontSize: 14,
    color: theme.text,
    fontFamily: Fonts.display,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
  },
  dropdownItemSelected: {
    backgroundColor: theme.primary,
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.text,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
  },
  dropdownItemTextSelected: {
    color: theme.primaryText,
    fontFamily: Fonts.sansBold,
  },
  noResultsText: {
    padding: Spacing.three,
    color: theme.textSecondary,
    textAlign: 'center',
    fontFamily: Fonts.display,
  },
  errorContainer: {
    padding: Spacing.three,
    backgroundColor: theme.backgroundElement,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginVertical: Spacing.two,
  },
  loadingText: {
    color: theme.textSecondary,
    fontFamily: Fonts.display,
  },
  errorText: {
    color: theme.dangerText,
    fontFamily: Fonts.sansBold,
    backgroundColor: theme.danger,
    padding: Spacing.one,
  },
  retryButton: {
    backgroundColor: theme.primary,
    padding: Spacing.oneHalf,
    paddingHorizontal: Spacing.three,
    borderRadius: 9999,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  retryButtonText: {
    color: theme.primaryText,
    fontFamily: Fonts.sansBold,
    letterSpacing: 1,
  },

});

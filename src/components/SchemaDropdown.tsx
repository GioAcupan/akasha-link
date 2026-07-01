import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../store';

interface SchemaDropdownProps {
  onSelect?: (domainId: string, mocId: string) => void;
}

export const SchemaDropdown = ({ onSelect }: SchemaDropdownProps) => {
  const { schema, isSchemaLoading, schemaError, loadSchema } = useAppStore();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedMocId, setSelectedMocId] = useState<string>('');

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedDomainId, selectedMocId);
    }
  }, [selectedDomainId, selectedMocId]);

  if (isSchemaLoading) {
    return <Text style={styles.text}>Loading Schema...</Text>;
  }

  if (schemaError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {schemaError}</Text>
        <TouchableOpacity style={styles.button} onPress={loadSchema}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!schema) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Schema not loaded yet.</Text>
        <TouchableOpacity style={styles.button} onPress={loadSchema}>
          <Text style={styles.buttonText}>Load Schema</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const domains = schema.domains || [];
  
  const selectedDomainObj = domains.find((d: any) => d.id === selectedDomainId);
  const mocs = selectedDomainObj?.mocs || [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Domain</Text>
      <ScrollView horizontal style={styles.row}>
        {domains.map((d: any) => (
          <TouchableOpacity 
            key={d.id} 
            style={[styles.pill, selectedDomainId === d.id && styles.pillSelected]}
            onPress={() => {
              setSelectedDomainId(d.id);
              setSelectedMocId('');
            }}
          >
            <Text style={[styles.pillText, selectedDomainId === d.id && styles.pillTextSelected]}>
              {d.label || d.id}
            </Text>
          </TouchableOpacity>
        ))}
        {domains.length === 0 && <Text style={styles.text}>No domains found.</Text>}
      </ScrollView>

      <Text style={styles.label}>MOC</Text>
      <ScrollView horizontal style={styles.row}>
        {mocs.map((m: any) => (
          <TouchableOpacity 
            key={m.id || m} 
            style={[styles.pill, selectedMocId === (m.id || m) && styles.pillSelected]}
            onPress={() => setSelectedMocId(m.id || m)}
          >
            <Text style={[styles.pillText, selectedMocId === (m.id || m) && styles.pillTextSelected]}>
              {m.label || m.id || m}
            </Text>
          </TouchableOpacity>
        ))}
        {mocs.length === 0 && <Text style={styles.text}>{selectedDomainId ? 'No MOCs found.' : 'Select a domain first.'}</Text>}
      </ScrollView>

      <Text style={styles.selectedText}>
        Selection: {selectedDomainId || 'None'} / {selectedMocId || 'None'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
  },
  text: {
    color: '#333',
  },
  error: {
    color: 'red',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: '#007AFF',
  },
  pillText: {
    color: '#333',
  },
  pillTextSelected: {
    color: '#fff',
  },
  selectedText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666',
  }
});

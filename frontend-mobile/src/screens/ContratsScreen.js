import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, ActivityIndicator, Chip } from 'react-native-paper';
import api from '../services/api';

const ContratsScreen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('/contrats')
            .then(res => setData(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1a5f7a" /></View>;
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}><Text style={styles.title}>Contrats</Text><Text style={styles.subtitle}>{data.length} elements</Text></View>
            {data.map((item, i) => (
                <Card key={i} style={styles.card}><Card.Content>
                    <View style={styles.row}><Title>#{item.id || i+1}</Title><Chip>Actif</Chip></View>
                    <Text style={styles.details}>{JSON.stringify(item, null, 2)}</Text>
                </Card.Content></Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16, backgroundColor: '#1a5f7a' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: 'rgba(255,255,255,0.8)' },
    card: { margin: 12, padding: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    details: { fontSize: 12, color: '#555' },
});
export default ContratsScreen;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, ActivityIndicator } from 'react-native-paper';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const DashboardScreen = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ espaces: 0, locataires: 0, contrats: 0, impayes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [e, l, c, f] = await Promise.all([
                    api.get('/api/espaces'),
                    api.get('/api/locataires'),
                    api.get('/api/contrats'),
                    api.get('/api/factures')
                ]);
                setStats({
                    espaces: e.data.data.length,
                    locataires: l.data.data?.length || 0,
                    contrats: c.data.data.length,
                    impayes: f.data.data?.filter(x => x.statut === 'impayee').length || 0
                });
            } catch (error) { console.error(error); }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1a5f7a" /></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Bonjour, {user?.nom || 'Utilisateur'}</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.grid}>
                <Card style={styles.card}><Card.Content><Title>{stats.espaces}</Title><Text>Espaces</Text></Card.Content></Card>
                <Card style={styles.card}><Card.Content><Title>{stats.locataires}</Title><Text>Locataires</Text></Card.Content></Card>
                <Card style={styles.card}><Card.Content><Title>{stats.contrats}</Title><Text>Contrats</Text></Card.Content></Card>
                <Card style={[styles.card, { borderColor: '#ef4444', borderWidth: 1 }]}><Card.Content><Title style={{ color: '#ef4444' }}>{stats.impayes}</Title><Text>Impayes</Text></Card.Content></Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#1a5f7a', paddingBottom: 30 },
    greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    date: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, marginTop: -16 },
    card: { width: '48%', margin: '1%', padding: 4 },
});
export default DashboardScreen;

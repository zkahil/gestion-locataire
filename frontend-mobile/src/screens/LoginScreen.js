
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import useAuthStore from '../store/authStore';

const LoginScreen = () => {
    const { login, loading } = useAuthStore();
    const [email, setEmail] = useState('admin@loc.fr');
    const [password, setPassword] = useState('admin123');

    const handleLogin = async () => {
        const result = await login(email, password);
        if (!result.success) Alert.alert('Erreur', result.error || 'Echec de connexion');
    };

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.title}>Gestion Locative</Text>
                <Text style={styles.subtitle}>Connectez-vous</Text>
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
                </TouchableOpacity>
                <Text style={styles.demo}>admin@loc.fr / admin123</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    box: { backgroundColor: '#fff', padding: 32, borderRadius: 12, width: '90%', maxWidth: 360 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1a5f7a' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: 24 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
    button: { backgroundColor: '#1a5f7a', padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    demo: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 12 },
});
export default LoginScreen;

import React from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableHighlight } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("db.db");

// export default function Options(props) {
export default class Options extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);

    }

    // const add = (text) => {
    //     // is text empty?
    //     if (text === null || text === "") {
    //         return false;
    //     }

    //     db.transaction(
    //         tx => {
    //             tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
    //             tx.executeSql("select * from items", [], (_, { rows }) =>
    //                 console.log(JSON.stringify(rows))
    //             );
    //         },
    //         null,
    //         update
    //     );
    // }
    render() {
        return (
            <View style={styles.container}>
                <TouchableHighlight style={{ alignSelf: 'flex-end', marginRight: 30, marginTop: 0 }}
                    onPress={() => {
                        this.setState({
                            modalVisible: !this.props.modalVisible
                        });
                    }}>

                    <Ionicons name="md-close" size={34} style={[{ color: "#fff" }]} />

                </TouchableHighlight>
                <TextInput
                    onChangeText={text => alert(text)}
                    onSubmitEditing={() => {
                        // add(text);
                        // setText(null);
                    }}
                    placeholder="Objetivo diario de pasos"
                    style={styles.input}
                    value=""
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0,
        paddingTop: 30,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#000",
        color: '#FFF'
    },
    themeStatusBarStyle: {
        backgroundColor: "#242C40",
        color: "#D0D0C0",
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: '#FFF'

    },
    flexRow: {
        flexDirection: "row"
    },
    input: {
        borderColor: "#ccc",
        borderRadius: 0,
        borderWidth: 1,
        height: 48,
        width: '100%',
        margin: 16,
        padding: 8,
        color: '#FFF'
    },
    listArea: {
        backgroundColor: "#f0f0f0",
        flex: 1,
        paddingTop: 16,
        color: '#FFF'
    },
    sectionContainer: {
        marginBottom: 16,
        marginHorizontal: 16
    },
    sectionHeading: {
        fontSize: 18,
        marginBottom: 8
    }
});

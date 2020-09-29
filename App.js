import React from "react";
import { Pedometer } from "expo-sensors";
import { StyleSheet, Text, View, Dimensions, StatusBar, Modal, TouchableHighlight } from "react-native";
import moment from "moment";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "react-native-vector-icons";
import Options from "./screens/Options";
import * as SQLite from 'expo-sqlite';

const screenWidth = Dimensions.get("window").width - 50;
const db = SQLite.openDatabase("db.db");

function getColor(progress) {
  var color = "#ff5349";
  if (progress > 75) {
    color = "#60A100";
  } else if (progress > 50) {
    color = "#FF8300";
  } else {
    color = "#DF362D";
  }
  return color;
}

export default class App extends React.Component {
  state = {
    isPedometerAvailable: "checking",
    pastStepCount: [],
    datesStepCount: [],
    todayStepCount: 0,
    currentStepCount: 0,
    percentToTarget: 0,
    totalDayDistance: 0,
    target: 10000,
    stepMeasure: 75,
    menCalPerKilometer: 68,
    womenCalPerKilometer: 56,
    colorIndicator: "#ff5349",
    location: null,
    altitude: null,
    modalVisible: false,

  };

  /**
   * Update current steps from now to 00:00 AM
   */
  update() {
    const end_ = moment().format("YYYY/MM/DD");
    const end = new Date(end_);
    const now = new Date();

    Pedometer.getStepCountAsync(end, now).then(
      result => {
        const progress = parseFloat((result.steps * 100) / this.state.target);
        const km = (result.steps * this.state.stepMeasure) / 100000;

        var color = getColor(progress);

        this.setState({
          todayStepCount: result.steps,
          percentToTarget: progress.toFixed(2),
          // We"r transform to km.
          totalDayDistance: km.toFixed(2),
          colorIndicator: color
        });
      },
      error => {
        this.setState({
          pastStepCount: "Could not get stepCount: " + error,
        });
      }
    );
  }

  toggleModal() {
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  componentDidMount() {
    this._subscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _subscribe = () => {

    db.transaction(tx => {
      tx.executeSql(
        "create table if not exists options (id integer primary key not null, target int, weight int, height int, gender text);"
      );
    });

    this._subscription = Pedometer.watchStepCount(result => {
      this.setState({
        currentStepCount: result.steps,

      });
      this.update();
    });

    Pedometer.isAvailableAsync().then(
      result => {
        this.setState({
          isPedometerAvailable: String(result),
        });
      },
      error => {
        this.setState({
          isPedometerAvailable: "Could not get isPedometerAvailable: " + error,
        });
      }
    );


    var pastSteps = [];
    var datesStep = [];

    for (let index = 0; index < 6; index++) {

      var end_ = moment().format("YYYY/MM/DD");
      var end = new Date(end_);
      end.setDate(end.getDate() - index);
      var start = new Date(end);
      start.setDate(start.getDate() - 1);

      Pedometer.getStepCountAsync(start, end).then(

        result => {
          var endStr_ = moment().format("YYYY/MM/DD");
          var endStr = new Date(endStr_);
          var endStr = endStr.setDate(endStr.getDate() - index - 1);
          pastSteps.push(result.steps);
          datesStep.push(moment(endStr).format('DD/MM'));
        },
        error => {

        }
      );
    }

    this.setState({
      pastStepCount: pastSteps,
      datesStepCount: datesStep,
    });



    this.update();

  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };



  render() {

    return (
      <View style={styles.container}>
        <TouchableHighlight style={{ alignSelf: 'flex-end', marginRight: 30 }}
          onPress={() => {
            this.toggleModal();
          }}>
          <Ionicons name="ios-settings" size={34} style={[{ color: "#666" }]} />
        </TouchableHighlight>
        <StatusBar barStyle={styles.themeStatusBarStyle} />
        <View style={{ flexDirection: 'row' }}>
          <View><AnimateTop pastStepCount={this.state.pastStepCount[3]} target={this.state.target} /><Text style={styles.indicatorMeasure}>{this.state.datesStepCount[3]}</Text></View>
          <View><AnimateTop pastStepCount={this.state.pastStepCount[2]} target={this.state.target} /><Text style={styles.indicatorMeasure}>{this.state.datesStepCount[2]}</Text></View>
          <View><AnimateTop pastStepCount={this.state.pastStepCount[1]} target={this.state.target} /><Text style={styles.indicatorMeasure}>{this.state.datesStepCount[1]}</Text></View>
          <View><AnimateTop pastStepCount={this.state.pastStepCount[0]} target={this.state.target} /><Text style={styles.indicatorMeasure}>{this.state.datesStepCount[0]}</Text></View>
        </View>
        <AnimatedCircularProgress
          size={screenWidth}
          width={10}
          backgroundWidth={30}
          fill={this.state.percentToTarget}
          tintColor={this.state.colorIndicator}
          backgroundColor="#333"
          padding={10}
          lineCap="round"
          arcSweepAngle={360}
        >
          {
            (fill) => (
              <View>
                <Text style={styles.label}>
                  Pasos hoy
                </Text>
                <Text style={{ color: this.state.colorIndicator, fontSize: 60, textAlign: "center", }} >
                  {this.state.todayStepCount}
                </Text>

                <Text style={styles.indicatorCurrent}>
                  <Text style={styles.indicatorMeasure}>%</Text> {this.state.percentToTarget}
                </Text>
                <Text style={styles.indicatorCurrent}>
                  <Text style={styles.indicatorMeasure}>Km.</Text> {this.state.totalDayDistance}
                </Text>
              </View>
            )
          }
        </AnimatedCircularProgress>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.indicatorIcon}><Ionicons name="md-paw" size={34} style={[{ color: "#666" }]} /></Text>
          <Text style={styles.indicatorNumber}> {this.state.target}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.indicatorIcon}><Ionicons name="ios-flame" size={34} style={[{ color: "#666" }]} /></Text>
          <Text style={styles.indicatorNumber}> {(this.state.totalDayDistance * this.state.menCalPerKilometer).toFixed(2)} <Text style={styles.indicatorMeasure}>Kcal</Text></Text>
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>



          <Options modalVisible={this.state.modalVisible} />
        </Modal>
      </View>
    );
  }
}

function AnimateTop(props) {

  const { pastStepCount, target } = props
  const progress = parseFloat((pastStepCount * 100) / target);
  var color = getColor(progress);

  return (
    <AnimatedCircularProgress
      size={screenWidth / 5}
      width={3}
      backgroundWidth={5}
      fill={progress.toFixed(2)}
      tintColor={color}
      backgroundColor="#333"
      padding={10}
      lineCap="round"
      arcSweepAngle={360}
    >
      {
        (fill) => (
          <View>
            <Text style={{ color: color, fontSize: 12, textAlign: "center" }} >
              {pastStepCount}
            </Text>
          </View>
        )
      }
    </AnimatedCircularProgress >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    paddingTop: 30,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#000",
  },
  label: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16
  },
  indicatorDay: {
    textAlign: "center",

    fontSize: 60
  },
  indicatorCurrent: {
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
  },
  indicatorIcon: {
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    alignContent: 'flex-start',
    width: '50%',
    paddingLeft: 60
  },
  indicatorMeasure: {
    color: "#d3d3d3",
    fontSize: 12,
    textAlign: 'center'
  },
  indicatorNumber: {
    color: "#fff",
    fontSize: 24,
    alignContent: 'flex-end',
    textAlign: 'left',
    width: '50%',
    paddingLeft: 15,
    paddingTop: 5
  },
  themeStatusBarStyle: {
    backgroundColor: "#242C40",
    color: "#D0D0C0",
  }
});
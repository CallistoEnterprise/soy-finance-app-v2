import styles from "./Lib.module.scss";
import Button from "../../components/atoms/Button";
import Preloader from "../../components/atoms/Preloader/Preloader";
import {useSnackbar} from "../../shared/providers/SnackbarProvider";
import SwitchTheme from "../../components/molecules/SwitchTheme";
import {ChangeEvent, useState} from "react";
import Switch from "../../components/atoms/Switch";
import Checkbox from "../../components/atoms/Checkbox";
import PickButton from "../../components/atoms/PickButton";
import IconButton from "../../components/atoms/IconButton";
import Svg from "../../components/atoms/Svg/Svg";
import Tabs from "../../components/molecules/Tabs";
import Tab from "../../components/atoms/Tab";

export default function Lib() {
  const {showMessage} = useSnackbar();

  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [checkboxEnabled, setCheckboxEnabled] = useState(false);

  const [activePickButton, setActivePickButton] = useState("0");
  const [activeCardPickButton, setActiveCardPickButton] = useState("0");
  const [activePickersSet, setActivePickersSet] = useState<string[]>([]);

  const [status, setStatus] = useState({
    input: "0",
    output: "0"
  });

  const [activeField, setActiveField] = useState("input");




  return <>
    <header>
      <SwitchTheme />
    </header>

    <div>
      <input type="text" value={status.input} onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setStatus({output: (+e.target.value * 2).toString(), input: e.target.value});
        setActiveField("input");
      }}/>
      <input type="text" value={status.output} onChange={
        (e: ChangeEvent<HTMLInputElement>) => {
          setStatus({input: (+e.target.value / 2).toString(), output: e.target.value});
          setActiveField("output");
        }}/>
    </div>

    <div>
      Values: {JSON.stringify(status, null, 2)}
      {activeField}
    </div>

    <div className={styles.container}>
      <div className={styles.componentColumn}>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Buttons</h4>
          <h5 className={styles.componentLabel}>Default button</h5>
          <Button>
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Default disabled button</h5>
          <Button disabled>
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Loading button</h5>
          <Button loading>
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Button with icon end</h5>
          <Button endIcon="arrow-right">
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Outline button</h5>
          <Button variant="outlined">
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Outline disabled button</h5>
          <Button disabled variant="outlined">
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Outline loading button</h5>
          <Button variant="outlined" loading>
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Outline button with endIcon</h5>
          <Button variant="outlined" endIcon="arrow-right">
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Large button</h5>
          <Button size="large">
            Click me
          </Button>
          <h5 className={styles.componentLabel}>Popup button</h5>
          <Button variant="popup">
            Click me
          </Button>
        </div>
      </div>
      <div className={styles.componentColumn}>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Preloader</h4>
          <h5 className={styles.componentLabel}>Circle preloader</h5>
          <Preloader/>

          <h5 className={styles.componentLabel}>Linear preloader</h5>
          <Preloader type="linear" />
        </div>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Toggle components</h4>
          <h5 className={styles.componentLabel}>Checkbox</h5>
          <Checkbox checked={checkboxEnabled} handleChange={() => setCheckboxEnabled(!checkboxEnabled)} id="test-checkbox" />

          <h5 className={styles.componentLabel}>Switch</h5>
          <Switch checked={switchEnabled} setChecked={() => setSwitchEnabled(!switchEnabled)} />

          <h5 className={styles.componentLabel}>Pick from multiple</h5>
          <div className={styles.defaultPickers}>
            <PickButton  isActive={activePickButton === "1"} onClick={() => setActivePickButton("1")}>
              Pick me
            </PickButton>

            <PickButton isActive={activePickButton === "2"} onClick={() => setActivePickButton("2")}>
              Pick me
            </PickButton>

            <PickButton isActive={activePickButton === "3"} onClick={() => setActivePickButton("3")}>
              Pick me
            </PickButton>
          </div>
          <h5 className={styles.componentLabel}>Pick multiple</h5>
          <div className={styles.defaultPickers}>
            <PickButton isActive={activePickersSet.includes("1")} onClick={() => {
              if(activePickersSet.includes("1")) {
                setActivePickersSet(activePickersSet.filter(v => v !== "1"))
              } else {
                setActivePickersSet([...activePickersSet, "1"]);
              }
            }} withCheckmark>
              Pick me
            </PickButton>
            <PickButton isActive={activePickersSet.includes("2")} onClick={() => {
              if(activePickersSet.includes("2")) {
                setActivePickersSet(activePickersSet.filter(v => v !== "2"))
              } else {
                setActivePickersSet([...activePickersSet, "2"]);
              }
            }} withCheckmark>
              Pick me
            </PickButton>
          </div>
          <h5 className={styles.componentLabel}>Pick from multiple</h5>
          <div className={styles.defaultCardPickers}>
            <PickButton view="card" isActive={activeCardPickButton === "1"} onClick={() => setActiveCardPickButton("1")}>
              Pick me
            </PickButton>

            <PickButton view="card" isActive={activeCardPickButton === "2"} onClick={() => setActiveCardPickButton("2")}>
              Pick me
            </PickButton>

            <PickButton view="card" isActive={activeCardPickButton === "3"} onClick={() => setActiveCardPickButton("3")}>
              Pick me
            </PickButton>
          </div>
        </div>
      </div>
      <div className={styles.componentColumn}>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Snackbars</h4>
          <div className={styles.snackbarsButtons}>
            <Button onClick={() => showMessage("This is success snackbar", "success")}>Success</Button>
            <Button onClick={() => showMessage("This is error snackbar", "error")}>Error</Button>
            <Button onClick={() => showMessage("This is warning snackbar", "warning")}>Warning</Button>
            <Button onClick={() => showMessage("This is info snackbar", "info")}>Info</Button>
          </div>
        </div>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Icon buttons</h4>
          <div className={styles.snackbarsButtons}>
            <IconButton variant="default">
              <Svg iconName="filters" />
            </IconButton>
            <IconButton variant="menu">
              <Svg iconName="wallet" />
            </IconButton>
            <IconButton variant="action">
              <Svg iconName="plus" />
            </IconButton>
            <IconButton variant="social">
              <Svg iconName="wallet" />
            </IconButton>
          </div>
        </div>
        <div className={styles.componentBox}>
          <h4 className={styles.title}>Tabs</h4>

          <h5 className={styles.componentLabel}>Default tabs</h5>
          <div className={styles.bordered}>
            <Tabs view="separate">
              <Tab title="Tab 1">
                <div className={styles.center}>Content of 1 tab</div>
              </Tab>
              <Tab title="Tab 2">
                <div className={styles.center}>Content of 2 tab</div>
              </Tab>
            </Tabs>
          </div>

          <h5 className={styles.componentLabel}>Small separate tabs</h5>
          <div className={styles.bordered}>
            <Tabs size="small" view="separate">
              <Tab title="Small tab 1">
                <div className={styles.center}>Content of 1 tab</div>
              </Tab>
              <Tab title="Small tab 1">
                <div className={styles.center}>Content of 2 tab</div>
              </Tab>
            </Tabs>
          </div>

          <h5 className={styles.componentLabel}>Merged tabs</h5>
          <div className={styles.bordered}>
            <Tabs view="merged">
              <Tab title="Tab 1">
                <div className={styles.center}>Content of 1 tab</div>
              </Tab>
              <Tab title="Tab 2">
                <div className={styles.center}>Content of 2 tab</div>
              </Tab>
              <Tab title="Tab 3">
                <div className={styles.center}>Content of 3 tab</div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  </>
}

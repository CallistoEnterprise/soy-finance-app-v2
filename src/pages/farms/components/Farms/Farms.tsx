import React, {ReactNode, useState} from "react";
import styles from "./Farms.module.scss";
import {Farm} from "../../FarmsPage";
import Svg from "../../../../components/atoms/Svg/Svg";
import clsx from "clsx";
import Collapse from "../../../../components/atoms/Collapse";
import IconButton from "../../../../components/atoms/IconButton";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";

interface Props {
  farms: Farm[]
}

type LabelType = "supreme" | "select" | "standard";

const iconsMap = {
  standard: "done",
  supreme: "supreme",
  select: "select"
}

function Label({type}: { type: LabelType }) {
  if (!type) {
    return <div/>;
  }

  return <div className={clsx(styles.label, styles[type])}>
    <Svg iconName={iconsMap[type]}/>
    {type.replace(/^\w/, (c) => c.toUpperCase())}
  </div>
}

function Farm({farm, index}) {
  const [isOpen, setIsOpen] = useState(false);

  return <div className={styles.farmWrapper} key={farm.pid}>
    <div key={farm.pid} className={styles.farm}>
      <div>{farm.token.symbol} - {farm.quoteToken.symbol}</div>
      <div><Label type={["standard", "supreme", "select", ""][index % 4]}/></div>
      <div>Earned: 0</div>
      <div>APR: 25%</div>
      <div>Liquidity: {`$${farm.liquidity.round(2).toString()}`}</div>
      <div>Multiplier: {farm.multiplier?.toString()}X</div>
      <IconButton onClick={() => setIsOpen(!isOpen)}>
        <Svg iconName="arrow-bottom"/>
      </IconButton>
    </div>
    <Collapse open={isOpen}>
      <div className={styles.collapsed}>
        <div className={styles.links}>
          <Text color="secondary" tag="h5">Links:</Text>
          <div style={{height: 30}} />
          <div className={styles.linksContainer}>
            <a href="#">Get SOY LP</a>
            <a href="#">View contract</a>
          </div>
        </div>
        <div className={styles.earned}>
          <div className={styles.linksContainer}>
            <Text color="secondary" tag="h5">Earned: 23.13 SOY</Text>
            <div>
              <Text>25.54</Text>
              {" "}
              <Text color="secondary">($123.13)</Text>
            </div>
          </div>
          <div style={{height: 16}} />
          <div className={styles.linksContainer}>
            <Button fullWidth>Harvest</Button>
          </div>
        </div>
        <div className={styles.stake}>
          <Text color="secondary" tag="h5">Stake SOY - CLO LP</Text>
          <div style={{height: 16}} />
          <div className={styles.linksContainer}>
            <Button fullWidth>Stake LP</Button>
          </div>
        </div>
      </div>
    </Collapse>
  </div>
}

export default function Farms({farms}: Props) {

  return <div className={styles.farmsContainer}>
    {farms.map((farm, index) => <Farm key={farm.pid} farm={farm} index={index} />)}
  </div>
}

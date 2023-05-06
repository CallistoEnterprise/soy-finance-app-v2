import React, {ReactNode} from "react";
import styles from "./PageCardHeading.module.scss";
import Text from "../../atoms/Text";

interface Props {
  title: string,
  content?: ReactNode
}

export default function PageCardHeading({title, content}: Props) {
  return <div className={styles.pageCardHeading}>
    <Text variant={24} weight={700} tag="h2">{title}</Text>
    {content && content}
  </div>;
}

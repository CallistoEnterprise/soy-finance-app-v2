import React from "react";
import styles from "./GrowthPoll.module.scss";
import Button from "../../../../shared/components/Button";

export default function GrowthPoll() {
  return <div className="paper">
    <h3 className="font-primary font-16 bold mb-10">Your opinion is important to us</h3>
    <div className={styles.voteContainer}>
      <div className={styles.soyLabel}>
        <div className={styles.soyIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.7129 11.5241C10.7775 11.8835 10.8817 12.7442 10.4839 13.7114C10.1667 14.4828 9.67663 14.9654 9.40179 15.2C9.42422 15.5387 9.41136 15.991 9.27055 16.4965C8.92844 17.7256 8.06325 18.4341 7.71557 18.689C7.41744 18.4145 6.80153 17.7728 6.4895 16.7418C6.2317 15.8903 6.29845 15.1613 6.36294 14.7714C6.29219 14.631 5.59319 13.1894 6.3466 11.9003C6.64682 11.3868 7.06525 11.0895 7.33695 10.933C7.27785 10.7132 6.76416 8.67795 8.01944 7.28971C8.21222 7.07665 8.75581 6.47545 9.67907 6.33798C10.7541 6.17814 11.5631 6.7634 11.7335 6.89255C11.5511 7.13438 11.0493 7.86525 11.043 8.91857C11.0378 9.78656 11.3721 10.4223 11.5351 10.692C11.4825 10.7991 11.4075 10.9259 11.3004 11.055C11.0958 11.3017 10.8674 11.4449 10.7129 11.5241Z" fill="#6DA316"/>
            <path d="M17.0359 13.545C17.0194 14.5742 16.5869 15.3105 16.3905 15.6054C16.5904 16.2158 16.6236 16.7412 16.5977 17.154C16.4053 20.2187 12.6518 21.8861 12.3854 22.0002C12.0073 21.4451 11.5154 20.5762 11.2296 19.4222C10.8049 17.7072 11.0585 16.2652 11.2465 15.5201C11.0891 15.2132 10.9455 14.8388 10.8698 14.4018C10.5602 12.6165 11.6239 11.1713 11.9175 10.7972C11.7502 10.5498 11.2233 9.70327 11.3624 8.58547C11.3746 8.48874 11.6266 6.69189 13.0841 6.17997C14.3575 5.73254 15.7405 6.55044 16.3868 7.57428C17.0622 8.64406 17.0107 10.0616 16.2582 11.1747C16.4597 11.4426 17.0559 12.3057 17.0359 13.545Z" fill="#6DA316"/>
            <path d="M12.3878 5.07211C12.5413 5.39386 12.5599 5.70799 12.5514 5.92312C12.5029 5.88932 12.4268 5.83956 12.3282 5.79033C11.8681 5.56081 11.4481 5.60571 11.2489 5.60189C10.4857 5.58785 9.70674 4.80081 9.39574 4.06751C9.15081 3.48954 9.19357 2.93809 9.25563 2.60352C9.29822 2.67927 9.36602 2.79022 9.46354 2.91313C9.85189 3.40304 10.2668 3.52283 10.8579 3.83521C11.5562 4.20429 12.1142 4.49917 12.3878 5.07211Z" fill="#588D00"/>
            <path d="M14.1145 4.39147C13.9681 4.78291 13.6851 5.35291 13.081 5.96191C12.1602 4.13213 12.2855 2.14477 13.3755 0.975825C13.9309 0.380345 14.6223 0.119789 15.1236 0C15.0415 0.165382 14.9133 0.439979 14.7893 0.791026C14.2353 2.35834 14.5572 3.20745 14.1145 4.39147Z" fill="#588D00"/>
            <path d="M17.8511 5.98474C17.2078 6.51695 16.2256 6.31776 15.2763 6.12516C14.7271 6.01386 14.2836 5.849 13.9713 5.71274C14.0844 5.52951 14.2687 5.2953 14.5606 5.14067C14.8634 4.98031 15.0355 5.03596 15.9678 4.91582C16.471 4.85099 16.7196 4.79898 16.9063 4.69514C17.3413 4.45331 17.4511 4.12428 17.9735 3.91868C18.1449 3.85107 18.296 3.82229 18.3972 3.80859C18.4257 3.97172 18.6444 5.32841 17.8511 5.98474Z" fill="#588D00"/>
          </svg>
        </div>
        Soy Finance
      </div>

      <div className={styles.voteButtons}>
        <Button variant="outlined" onClick={() => {
          return;
        }} endIcon="arrow-up">Bullish</Button>
        <Button variant="outlined" mode="error" onClick={() => {
          return;
        }} endIcon="arrow-up">Bearish</Button>
      </div>
    </div>
  </div>;
}

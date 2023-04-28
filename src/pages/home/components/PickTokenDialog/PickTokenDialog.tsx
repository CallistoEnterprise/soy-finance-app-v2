import React, {ChangeEvent, useMemo, useState} from "react";
import styles from "./PickTokenDialog.module.scss";
import Tabs from "../../../../shared/components/Tabs";
import Tab from "../../../../shared/components/Tab";
import {swapTokensList} from "../Swap/constants";
import clsx from "clsx";
import Dialog from "../../../../shared/components/Dialog";
import useNetworkSectionBalance from "../../../../shared/hooks/useNetworkSectionBalance";
import {formatBalance, isNativeToken} from "../../../../shared/utils";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import Svg from "../../../../shared/components/Svg/Svg";

interface Props {
  isOpened: boolean,
  handleClose: any,
  pickToken: any
}

export default function PickTokenDialog({isOpened, handleClose, pickToken}: Props) {
  const [favoriteTokensToPick, setFavoriteTokensToPick] = useState<string[]>([]);
  const {chainId} = useWeb3();
  const {isLoading, contracts, network} = useNetworkSectionBalance({chainId});

  const [searchRequest, setSearchRequest] = useState("");

  console.log(searchRequest);

  if(!chainId) {
    return;
  }

  const filteredList = useMemo(() => {
    return swapTokensList.filter(token => {
      if(!searchRequest) {
        return true;
      }

      return token[chainId].token_address.toLowerCase() === searchRequest.toLowerCase() || token[chainId].original_name.toLowerCase().startsWith(searchRequest.toLowerCase());
    })
  }, [searchRequest])

  return <Dialog isOpen={isOpened} onClose={handleClose}>
    <div className={styles.pickTokenDialog}>
      <h2 className="font-32 bold center mb-20">Select a token</h2>
      <div className={styles.searchTokenWrapper}>
        <input onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchRequest(e.target.value)} className={styles.searchToken} placeholder="Name or address" />
      </div>
      <div className={styles.baseTokens}>
        <button className={styles.baseTokenButton}>
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_741_9365)">
              <circle cx="12.333" cy="12" r="12" fill="white"/>
              <path d="M7.69238 5.26638C7.70864 5.24709 7.71124 5.22316 7.71565 5.19972C7.76733 4.92545 7.91028 4.71291 8.155 4.57608C8.40759 4.43485 8.66876 4.42954 8.9309 4.55197C9.0568 4.61068 9.1723 4.68856 9.29173 4.75896C10.2583 5.32843 11.2246 5.89834 12.1908 6.46869C12.7606 6.8048 13.3302 7.14099 13.8998 7.47726C13.936 7.49872 13.9727 7.51946 14.0031 7.5499C14.1058 7.65237 14.1322 7.77238 14.0897 7.90922C14.0789 7.94394 14.0612 7.97552 14.0432 8.00693C13.6252 8.73243 13.2072 9.458 12.7893 10.1836C12.7517 10.2489 12.7089 10.3079 12.64 10.3449C12.4744 10.4337 12.2788 10.3824 12.1833 10.2208C12.1108 10.098 12.042 9.97308 11.9718 9.84902C11.9252 9.76693 11.8779 9.68525 11.8328 9.60231C11.7569 9.46258 11.742 9.31707 11.7993 9.16716C11.8364 9.07071 11.8996 8.9944 11.9825 8.93316C12.0261 8.90097 12.0695 8.86824 12.1102 8.83256C12.2294 8.72821 12.2944 8.59614 12.304 8.43822C12.3058 8.40611 12.3031 8.37392 12.296 8.34255C12.2524 8.15129 12.1657 7.99168 11.9657 7.92422C11.9071 7.90445 11.8449 7.89487 11.7838 7.88245C11.3723 7.79842 10.9607 7.71468 10.549 7.63121C10.4523 7.61162 10.3562 7.59077 10.2594 7.57292C9.95025 7.51596 9.73091 7.70789 9.662 7.91615C9.48569 8.44907 9.30376 8.98066 9.1309 9.51484C9.07729 9.68019 9.08557 9.8483 9.18016 10.0027C9.31392 10.221 9.60488 10.3003 9.83178 10.1812C9.84263 10.1759 9.85293 10.1696 9.86255 10.1624C9.9601 10.084 10.0755 10.0687 10.1932 10.0791C10.3832 10.0959 10.5244 10.1946 10.6187 10.3589C10.7246 10.5435 10.8265 10.7305 10.9343 10.914C11.0306 11.078 10.9821 11.2654 10.8652 11.3765C10.7998 11.4386 10.7227 11.4725 10.6314 11.4723C10.4823 11.4721 10.3333 11.4721 10.1844 11.4723C9.4898 11.4723 8.79518 11.4723 8.10055 11.4723C8.04615 11.4723 7.99242 11.4689 7.93995 11.4511C7.82662 11.4124 7.75476 11.3345 7.71813 11.2225C7.71209 11.2039 7.71251 11.1826 7.69269 11.1708L7.69238 5.26638Z" fill="#00B37E"/>
              <path d="M7.69238 12.8456C7.70647 12.8356 7.71118 12.8202 7.71517 12.8046C7.74914 12.6708 7.87292 12.5492 8.06773 12.5469C8.07982 12.5469 8.0919 12.5469 8.10399 12.5469C8.92564 12.5469 9.74727 12.5469 10.5689 12.5469C10.6154 12.5469 10.6615 12.5487 10.7064 12.5614C10.9229 12.6223 11.0181 12.8709 10.9349 13.0549C10.9266 13.073 10.9173 13.0911 10.9076 13.1085C10.7785 13.3422 10.6487 13.5755 10.5204 13.8096C10.4816 13.8805 10.4306 13.9376 10.3577 13.9737C10.2493 14.0275 10.1414 14.0289 10.0341 13.9706C9.92674 13.9124 9.81921 13.8525 9.71054 13.7958C9.62501 13.7513 9.53477 13.7419 9.44181 13.7717C9.36808 13.7948 9.30492 13.8432 9.26351 13.9083C9.21201 13.9873 9.16257 14.0678 9.11283 14.148C9.08321 14.1957 9.07384 14.2489 9.07602 14.3039C9.07791 14.3561 9.0873 14.4077 9.10388 14.4573C9.3027 15.0505 9.501 15.6439 9.69881 16.2375C9.74565 16.3777 9.91036 16.5434 10.1498 16.495C10.5064 16.4226 10.863 16.3486 11.219 16.2753C11.4632 16.225 11.707 16.1728 11.9517 16.1255C12.0587 16.1048 12.1431 16.0537 12.2063 15.9677C12.2647 15.8883 12.3174 15.805 12.3641 15.7182C12.4614 15.5374 12.3748 15.3425 12.2339 15.2471C12.1957 15.2212 12.1553 15.1981 12.1161 15.1739C12.039 15.1267 11.9615 15.0799 11.8847 15.0322C11.8007 14.98 11.7431 14.9077 11.722 14.81C11.7025 14.7195 11.7199 14.6346 11.7643 14.5544C11.844 14.4104 11.9237 14.2664 12.0035 14.1224C12.0617 14.017 12.119 13.911 12.1784 13.8062C12.2308 13.7136 12.3095 13.6555 12.416 13.6385C12.5538 13.6165 12.6651 13.6622 12.7493 13.7728C12.7645 13.7939 12.7782 13.8161 12.7905 13.8391C13.2099 14.5752 13.6294 15.3113 14.0489 16.0474C14.078 16.0985 14.1016 16.1515 14.1074 16.2102C14.1218 16.3593 14.0616 16.4719 13.9344 16.5487C13.8277 16.6131 13.7195 16.6753 13.612 16.7379C12.0956 17.6253 10.5793 18.5125 9.06302 19.3995C8.97937 19.4485 8.89288 19.4899 8.79889 19.5149C8.78408 19.5189 8.76656 19.5197 8.75568 19.5338H8.4172C8.39574 19.5176 8.36885 19.5168 8.34467 19.5088C8.00221 19.3959 7.78722 19.1682 7.71541 18.8122C7.71121 18.7867 7.70346 18.7619 7.69238 18.7385V12.8456Z" fill="#02405C"/>
              <path d="M14.4304 11.2914C14.2875 11.2914 14.1445 11.2932 14.0013 11.291C13.8414 11.2885 13.7108 11.1866 13.6668 11.0345C13.6366 10.9304 13.6515 10.8325 13.7053 10.7392C13.7914 10.5895 13.8765 10.4392 13.962 10.2891L14.9432 8.56693C14.9601 8.53728 14.9763 8.5072 14.9944 8.47826C15.0886 8.32757 15.2697 8.27332 15.4323 8.34722C15.513 8.38393 15.587 8.43293 15.6632 8.47772C16.5804 9.01661 17.4974 9.55573 18.4142 10.0951C19.0607 10.4752 19.7074 10.8552 20.3544 11.2351C20.5758 11.3649 20.7203 11.5505 20.7819 11.7999C20.7912 11.8376 20.7928 11.8754 20.7933 11.9134C20.7941 11.9737 20.7912 12.0339 20.794 12.0942C20.8001 12.2273 20.7587 12.3474 20.6965 12.4619C20.6197 12.6034 20.5082 12.7109 20.3697 12.7918C19.8818 13.0769 19.394 13.3623 18.9064 13.6478L17.0629 14.726C16.5404 15.0314 16.018 15.3369 15.4955 15.6426C15.4284 15.6818 15.3587 15.7081 15.2786 15.7057C15.1581 15.702 15.0665 15.6488 15.0006 15.5509C14.9683 15.5027 14.9417 15.4505 14.9134 15.3996C14.5225 14.7001 14.1317 14.0007 13.7408 13.3012C13.6883 13.2075 13.6667 13.1098 13.6913 13.0059C13.7309 12.8389 13.868 12.7323 14.0419 12.7293C14.1244 12.7278 14.207 12.7293 14.2897 12.7293C14.4729 12.7293 14.6561 12.7293 14.8394 12.7293C14.9195 12.7293 14.9948 12.7473 15.0623 12.7925C15.1417 12.846 15.1881 12.9215 15.207 13.0135C15.2145 13.0509 15.2181 13.089 15.2175 13.1272C15.2167 13.2417 15.2195 13.3563 15.2168 13.4708C15.2129 13.6415 15.343 13.7979 15.5222 13.8291C15.5401 13.8321 15.5581 13.8336 15.5762 13.8336C15.6527 13.8341 15.7292 13.8336 15.8059 13.8336C15.8626 13.8338 15.9181 13.8172 15.9653 13.7859C16.0093 13.7575 16.0491 13.7232 16.0837 13.6839C16.4195 13.3021 16.7554 12.9204 17.0915 12.5386C17.1805 12.4375 17.2677 12.3348 17.3591 12.2358C17.4784 12.1066 17.4685 11.9107 17.3584 11.7867C16.9315 11.3055 16.508 10.8213 16.0831 10.3383C16.0553 10.3067 16.0311 10.272 15.9948 10.2483C15.9465 10.2166 15.8958 10.1935 15.8377 10.1929C15.737 10.1918 15.6361 10.1879 15.5358 10.1941C15.3578 10.2051 15.2223 10.3491 15.2182 10.5279C15.2154 10.6564 15.2177 10.7849 15.2172 10.9137C15.2168 11.0162 15.1858 11.1066 15.1119 11.1808C15.0381 11.255 14.951 11.2926 14.8472 11.293C14.7082 11.2935 14.5692 11.293 14.4302 11.293L14.4304 11.2914Z" fill="#00B37E"/>
            </g>
            <defs>
              <clipPath id="clip0_741_9365">
                <rect x="0.333008" width="24" height="24" rx="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>

          CLO
        </button>
        <button className={styles.baseTokenButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#F5F5F5"/>
            <path d="M10.7642 12.4278C10.8171 12.7218 10.9023 13.426 10.5769 14.2173C10.3173 14.8485 9.91636 15.2434 9.69149 15.4353C9.70984 15.7124 9.69931 16.0825 9.58411 16.4961C9.3042 17.5017 8.59631 18.0814 8.31185 18.2899C8.06793 18.0654 7.564 17.5403 7.3087 16.6968C7.09777 16.0001 7.15239 15.4036 7.20516 15.0847C7.14727 14.9698 6.57536 13.7902 7.19179 12.7355C7.43742 12.3154 7.77977 12.0722 8.00207 11.9441C7.95372 11.7642 7.53342 10.0991 8.56047 8.96324C8.71821 8.78892 9.16296 8.29703 9.91835 8.18455C10.7979 8.05378 11.4598 8.53262 11.5992 8.63829C11.45 8.83615 11.0394 9.43414 11.0343 10.2959C11.03 11.0061 11.3035 11.5262 11.4369 11.7469C11.3938 11.8346 11.3325 11.9383 11.2449 12.0439C11.0775 12.2458 10.8906 12.3629 10.7642 12.4278Z" fill="#6DA316"/>
            <path d="M15.9375 14.0816C15.924 14.9237 15.5701 15.5261 15.4094 15.7673C15.573 16.2667 15.6001 16.6966 15.5789 17.0344C15.4215 19.5419 12.3504 20.9061 12.1325 20.9994C11.8232 20.5453 11.4207 19.8344 11.1868 18.8902C10.8394 17.487 11.0469 16.3072 11.2006 15.6975C11.0719 15.4465 10.9544 15.1401 10.8924 14.7825C10.6391 13.3219 11.5094 12.1394 11.7497 11.8333C11.6128 11.6309 11.1817 10.9383 11.2955 10.0238C11.3055 9.94462 11.5117 8.47448 12.7042 8.05563C13.746 7.68955 14.8776 8.35874 15.4064 9.19643C15.959 10.0717 15.9169 11.2315 15.3011 12.1422C15.466 12.3614 15.9538 13.0676 15.9375 14.0816Z" fill="#6DA316"/>
            <path d="M12.1343 7.15062C12.2599 7.41387 12.2751 7.67088 12.2681 7.8469C12.2285 7.81924 12.1662 7.77854 12.0855 7.73825C11.709 7.55046 11.3654 7.5872 11.2024 7.58408C10.578 7.57259 9.94068 6.92865 9.68623 6.32868C9.48583 5.85579 9.52081 5.40461 9.57159 5.13086C9.60644 5.19284 9.66191 5.28362 9.7417 5.38418C10.0594 5.78501 10.3989 5.88302 10.8825 6.13861C11.4539 6.44058 11.9104 6.68185 12.1343 7.15062Z" fill="#588D00"/>
            <path d="M13.547 6.59302C13.4272 6.91329 13.1957 7.37965 12.7014 7.87793C11.948 6.38083 12.0506 4.75481 12.9424 3.7984C13.3968 3.31119 13.9624 3.09801 14.3726 3C14.3055 3.13531 14.2005 3.35998 14.0991 3.6472C13.6458 4.92955 13.9093 5.62427 13.547 6.59302Z" fill="#588D00"/>
            <path d="M16.6041 7.89572C16.0777 8.33116 15.2741 8.16819 14.4974 8.01061C14.0481 7.91955 13.6853 7.78466 13.4297 7.67318C13.5223 7.52325 13.673 7.33163 13.9118 7.20511C14.1596 7.07391 14.3004 7.11944 15.0632 7.02115C15.475 6.9681 15.6784 6.92555 15.8311 6.84059C16.187 6.64273 16.2769 6.37352 16.7043 6.2053C16.8445 6.14998 16.9681 6.12644 17.0509 6.11523C17.0742 6.2487 17.2531 7.35872 16.6041 7.89572Z" fill="#588D00"/>
          </svg>

          SOY
        </button>
        <button className={styles.baseTokenButton}>
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_741_9383)">
              <circle cx="12.666" cy="12" r="12" fill="white"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M11.7692 15.1328H9.21213V8.86814H11.7692V4.95117H9.84032V6.93922H7.2832V17.0618H9.84032V19.0498H11.7692V15.1328ZM18.0019 14.241C18.0955 13.0906 17.4279 12.2358 17.2382 12.0116C17.3934 11.8268 18.2138 10.8045 18.0192 9.4446C17.8295 8.1217 16.7578 7.00573 15.3142 6.66084V4.95117H13.3853V8.86814H14.8708C15.4226 8.86814 15.9326 9.22535 16.0582 9.7624C16.0681 9.80428 16.0755 9.84615 16.0828 9.8905V9.9102C16.1469 10.5162 15.6443 11.036 15.0359 11.036H11.1411V12.9649H15.164C15.6764 12.9649 16.1469 13.3197 16.2208 13.8247C16.2257 13.8641 16.2307 13.9085 16.2307 13.9528C16.238 14.2164 16.1494 14.4702 15.9868 14.6795C15.7527 14.9801 15.3758 15.1328 14.9964 15.1328H13.3853V19.0498H15.3142V17.111C16.817 16.7366 17.8911 15.5639 18.0019 14.241Z" fill="#AB0C30"/>
            </g>
            <defs>
              <clipPath id="clip0_741_9383">
                <rect x="0.666016" width="24" height="24" rx="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>

          BUSDT
        </button>
      </div>
      <Tabs view="merged">
        <Tab title="All">
          <div className={styles.tokensList}>
            {!!searchRequest && !filteredList.length ? <div className={styles.noSearch}>
                <div className={styles.bigIconWrapper}>
                  <Svg size={84} iconName="search" />
                </div>
                <h4>No tokens found</h4>
                <p>We did not find tokens with such a name</p>
              </div> :
            <ul>
              {filteredList.filter(token => Boolean(token[chainId])).map(token => {
                return <li className={styles.pickTokenListItem} key={token[chainId].token_address}>
                  <button className={clsx(styles.favButton, favoriteTokensToPick.includes(token[chainId].token_address) && styles.active)} onClick={() => {
                    if(favoriteTokensToPick.includes(token[chainId].token_address)) {
                      setFavoriteTokensToPick(favoriteTokensToPick.filter(v => v !== token[chainId].token_address));
                    } else {
                      setFavoriteTokensToPick([...favoriteTokensToPick, token[chainId].token_address]);
                    }
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0003 17.2698L16.1503 19.7798C16.9103 20.2398 17.8403 19.5598 17.6403 18.6998L16.5403 13.9798L20.2103 10.7998C20.8803 10.2198 20.5203 9.11977 19.6403 9.04977L14.8103 8.63977L12.9203 4.17977C12.5803 3.36977 11.4203 3.36977 11.0803 4.17977L9.19032 8.62977L4.36032 9.03977C3.48032 9.10977 3.12032 10.2098 3.79032 10.7898L7.46032 13.9698L6.36032 18.6898C6.16032 19.5498 7.09032 20.2298 7.85032 19.7698L12.0003 17.2698Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button className={styles.pickTokenButton} onClick={() => {
                    pickToken(token[chainId]);
                    handleClose();
                  }}>
                    <div className={styles.tokenButtonInfo}>
                      <img height={40} width={40} src={token[chainId].imgUri} alt={token[chainId].original_name} />
                      {token[chainId].original_name}
                    </div>

                    <span className={styles.tokenBalance}>
                      {isNativeToken(token[chainId].token_address) ?
                        formatBalance(network?.balance) :
                        formatBalance(contracts?.find(c => c.symbol === token[chainId].original_name)?.balance) || "0.0"
                      }
                    </span>
                  </button>
                </li>
              })}
            </ul>}

          </div>
        </Tab>
        <Tab title="My list">
          <div className={styles.tokensList}>
            {!!swapTokensList.filter(t => Boolean(t[chainId]) && favoriteTokensToPick.includes(t[chainId].token_address)).length ?
              <>{!!searchRequest && !filteredList.length ? <ul>
                {filteredList.filter(t => favoriteTokensToPick.includes(t[chainId].token_address)).map(token => {
                  return <li key={token[chainId].token_address} className={styles.pickTokenListItem}>
                    <button className={clsx(styles.favButton, favoriteTokensToPick.includes(token[chainId].token_address) && styles.active)} onClick={() => {
                      setFavoriteTokensToPick(favoriteTokensToPick.filter(v => v !== token[chainId].token_address));
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.0003 17.2698L16.1503 19.7798C16.9103 20.2398 17.8403 19.5598 17.6403 18.6998L16.5403 13.9798L20.2103 10.7998C20.8803 10.2198 20.5203 9.11977 19.6403 9.04977L14.8103 8.63977L12.9203 4.17977C12.5803 3.36977 11.4203 3.36977 11.0803 4.17977L9.19032 8.62977L4.36032 9.03977C3.48032 9.10977 3.12032 10.2098 3.79032 10.7898L7.46032 13.9698L6.36032 18.6898C6.16032 19.5498 7.09032 20.2298 7.85032 19.7698L12.0003 17.2698Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button className={styles.pickTokenButton} onClick={() => {
                      pickToken(token[chainId]);
                      handleClose();
                    }}>
                      <div className={styles.tokenButtonInfo}>
                        <img height={40} width={40} src={token[chainId].imgUri} alt={token[chainId].original_name} />
                        {token[chainId].original_name}
                      </div>

                      <span className={styles.tokenBalance}>{isNativeToken(token[chainId].token_address) ?
                        formatBalance(network?.balance) :
                        formatBalance(contracts?.find(c => c.symbol === token[chainId].original_name)?.balance) || "0.0"
                      }</span>
                    </button>
                  </li>
                })}
              </ul> :  <div className={styles.noSearch}>
                <div className={styles.bigIconWrapper}>
                  <Svg size={84} iconName="search" />
                </div>
                <h4>No tokens found</h4>
                <p>We did not find tokens with such a name</p>
              </div>}</>
               :
              <div className={styles.noSearch}>
                <div className={styles.bigIconWrapper}>
                  <Svg size={84} iconName="search" />
                </div>
                <h4>No favorite tokens yet</h4>
                <p>We did not find tokens with such a name</p>
              </div>}
              </div>
        </Tab>
      </Tabs>


    </div>
  </Dialog>;
}

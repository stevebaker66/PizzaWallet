import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Account from "./components/Account/Account";
import ERC20Balance from "./components/ERC20Balance";
import NFTBalance from "./components/NFTBalance";
import ERC20Transfers from "./components/ERC20Transfers";
import DEX from "./components/DEX";
import Wallet from "./components/Wallet";
// import SignIn from "./components/SignIn";
import Onramper from "./components/Onramper";
import { Layout, Tabs, Alert } from "antd";
import "antd/dist/antd.css";
// import NativeBalance from "./components/NativeBalance";
import "./style.css";
// import Text from "antd/lib/typography/Text";
// import MenuItems from "./components/MenuItems";
// import SideBar from "./components/side-bar/SideBar";
import PizzaWalletLogo from "./assets/pizza-wallet-logo.svg";
const { Header, Sider, Content } = Layout;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    padding: "10px",
    height: "100vh",
  },
  header: {
    zIndex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    // borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    // boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    float: "right",
    gap: "8px",

    fontSize: "15px",
    fontWeight: "600",
  },
  siderBalance: {
    margin: "15px",
    fontSize: "30px",
    borderRadius: "1em",
    backgroundColor: "#141414",
  },
  errorDiv: {
    width: "100%",
    display: "flex",
    marginTop: "1em",
    justifyContent: "center",
  },
  bglogin: {
    height: "100vh",
    display: "grid",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(90deg, #1eb7ef, #b114fb)",
  },
};
const App = () => {
  const {
    isWeb3Enabled,
    enableWeb3,
    isAuthenticated,
    isWeb3EnableLoading,
    authError,
  } = useMoralis();

  const [collapsedSideBar, setCollapsedSideBar] = useState(false);

  useEffect(() => {
    type Web3ProviderType = any;
    const connectorId: Web3ProviderType =
      window.localStorage.getItem("connectorId");
    const chainId: number = Number(window.localStorage.getItem("chainId"));
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({
        provider: connectorId,
        clientId:
          "BKHvc6j0wd4pp3KVIMfHBjGPkz-4gQo5HA7LjLzRmzxV2cWVkjf1gyhmZwQAIKmezaq5mVhnphnkK-H29vrAEY4",
        // rpcTarget:
        //   "https://kovan.infura.io/v3/f79f2eecc6f1408692098c78dcbdf228",
        chainId: chainId,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  // if (!isAuthenticated) {
  //   return (
  //     <Layout className="fade" style={styles.bglogin}>
  //       <SignIn />
  //     </Layout>
  //   );
  // } else {
  return (
    <Layout hasSider>
      <Router>
        <Sider
          width={293}
          breakpoint="sm"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
            setCollapsedSideBar(!collapsedSideBar);
          }}
          style={{
            height: "100vh",
            position: "fixed",
            width: "293px",
            backgroundColor: "#FFF5CE",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {/* render logo here */}
          <div style={{ display: "flex" }}>
            <Logo />
          </div>
          {/* render navigation buttons here */}
          {/* <div style={styles.siderBalance}>
            <Text style={{ fontSize: "15px", margin: "10px" }} strong>
              Balance
            </Text>
            <NativeBalance />
          </div>
          <MenuItems /> */}
        </Sider>
        <Layout
          className="site-layout"
          style={{
            marginLeft: collapsedSideBar ? 0 : 293,
            backgroundColor: "#2C2A51",
          }}
        >
          <Header
            style={{
              padding: 0,
              backgroundColor: "#2C2A51",
            }}
          >
            <div style={{ float: "right", marginRight: "10px" }}>
              <Account />
            </div>
          </Header>
          <Content>
            {authError && (
              <div style={styles.errorDiv}>
                <Alert message={authError.message} type="error" closable />
              </div>
            )}
            <div style={styles.content}>
              <Switch>
                <Route path="/dashboard">
                  <Tabs defaultActiveKey="1" style={{ alignItems: "center" }}>
                    <Tabs.TabPane tab={<span>Tokens</span>} key="1">
                      <ERC20Balance />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span>NFTs</span>} key="2">
                      <NFTBalance />
                    </Tabs.TabPane>
                  </Tabs>
                </Route>
                <Route path="/transfer">
                  <Wallet />
                </Route>
                <Route path="/activity">
                  <ERC20Transfers />
                </Route>
                <Route path="/dex">
                  <DEX />
                </Route>
                <Route path="/onramper">
                  <Onramper />
                </Route>
                <Route path="/">
                  <Redirect to="/dashboard" />
                </Route>
                <Route path="/home">
                  <Redirect to="/dashboard" />
                </Route>
                <Route path="/nonauthenticated">
                  <>Please login using the "Authenticate" button</>
                </Route>
              </Switch>
            </div>
          </Content>
        </Layout>
      </Router>
    </Layout>
  );
  // }
};

export const Logo = () => (
  <div style={{ display: "flex", padding: "10px" }}>
    <img src={PizzaWalletLogo} alt="logo" />
  </div>
);

export default App;

import * as React from "react";
import { Dialog, Flex, Text, TextField, Button, Box, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { TablerSettings } from "./Icones/Tabler";

type MeResp = { logged_in: boolean; username: string };

const LoginDialog = () => {
  const [t] = useTranslation();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [twoFac, setTwoFac] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [require2Fac /*, setRequire2Fac*/] = React.useState(true); // Assuming 2FA is initially hidden

  // Validate inputs
  const isFormValid = username.trim() !== "" && password.trim() !== "";

  // Handle login
  const handleLogin = async () => {
    if (!isFormValid) {
      setErrorMsg("Username and password are required");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("./api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          ...(twoFac && !require2Fac ? { twoFac } : {}),
        }),
      });
      const data = await res.json();
      if (res.status === 200) {
        window.open("/admin", "_self");
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const [me, setMe] = React.useState<MeResp>({ logged_in: false, username: "" });

  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        const resp = await fetch("./api/me", { cache: "force-cache" });
        const data = await resp.json();
        if (resp.status === 200) {
          setMe({ logged_in: data.logged_in, username: data.username });
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchMe();
  }, []);
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && isFormValid) {
      e.preventDefault(); // Prevent form submission issues
      handleLogin();
    }
  };

  return me.logged_in ? (
    <Link to="/admin">
      <IconButton><TablerSettings/></IconButton>
    </Link>
  ) : (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>{t("login.title")}</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>{t("login.title")}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t("login.desc")}
        </Dialog.Description>
        <Box
          onSubmit={(e) => {
            e.preventDefault(); // Prevent native form submission
            if (isFormValid && !isLoading) {
              handleLogin();
            }
          }}
        >
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {t("login.username")}
              </Text>
              <TextField.Root
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="admin"
                disabled={isLoading}
                autoFocus // Focus on username by default
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {t("login.password")}
              </Text>
              <TextField.Root
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                type="password"
                placeholder={t("login.password_placeholder")}
                disabled={isLoading}
              />
            </label>
            <label hidden={require2Fac}>
              <Text as="div" size="2" mb="1" weight="bold">
                {t("login.two_factor")}
              </Text>
              <TextField.Root
                value={twoFac}
                onChange={(e) => setTwoFac(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="000000"
                disabled={isLoading}
              />
            </label>
            {errorMsg && (
              <Text as="div" size="2" color="red">
                {errorMsg}
              </Text>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              style={{ opacity: isLoading || !isFormValid ? 0.6 : 1 }}
              onClick={handleLogin}
            >
              {isLoading ? "Logging in..." : t("login.title")}
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/api/oauth";
              }}
              variant="soft"
              disabled={isLoading}
              type="button" // Prevent form submission
            >
              {t("login.login_with_github")}
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default LoginDialog;

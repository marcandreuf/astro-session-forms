function nullishCoalesingAssignment(
  cursession: { [key: string]: any },
  formOptions = {
    csrf: {
      formFiled: "request-validation-token",
      sessionFiled: "request-validation-secret",
    },
  }
) {
  const currentSession = cursession;
  return (currentSession[formOptions.csrf.sessionFiled] ??= "654321");
}

describe("Learning test operators", () => {
  test("Test the nullish coalescing assignment", () => {
    const cs: { [key: string]: any } = {};
    cs["request-validation-secret"] = "<secret>";
    console.log("CS before:", cs);
    console.log("Secret: ", nullishCoalesingAssignment(cs));
    console.log("CS after:", cs);
  });
});

describe("Learning ref assignments", () => {
  test("Test references assignation", () => {
    const sessionData: any = {};
    const locals_session = sessionData;
    console.log("Session data before:", sessionData);
    console.log("Locals session before:", locals_session);

    const currentSession = locals_session;
    currentSession['key-secret'] = 'secret';

    console.log('After Current Session: ', currentSession);
    console.log('After Session Data: ', sessionData);
    console.log('After Locals Session: ', locals_session);

  });
});

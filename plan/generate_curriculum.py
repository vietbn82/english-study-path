import json
import os

days = []

# --- SPRINT 1: Days 1 - 30 (Physical Articulatory Mechanics & Daily Standup) ---
sprint1_curriculum = [
    # Day 1
    (1, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Final /t/ vs /d/ in Code & Git Actions",
     "Làm chủ âm đuôi /t/ và /d/ - khắc phục lỗi nuốt âm cuối của người Việt trong từ vựng Git & Code.",
     ("Final /t/ vs /d/", "/t/, /d/", "Đầu lưỡi (Tip)", "Ngạc cứng sau răng trên (Alveolar Ridge)", "Plosive / Bật nén hơi", False,
      "Ép chặt đầu lưỡi vào ngạc cứng, nén khí. Với /t/, giật lưỡi nhả luồng gió dứt khoát không rung cổ họng. Với /d/, nhả hơi nhẹ đồng thời làm rung dây thanh âm.",
      "Người Việt có thói quen phát âm unreleased coda (ngậm miệng không nhả hơi), nuốt mất 't' và 'd'.",
      "Đặt tay trước miệng thấy luồng gió mát (/t/), đặt tay lên cổ họng thấy rung nhẹ (/d/)."),
     [("commit", "/kəˈmɪt/", "Lưu thay đổi", "I will commit the changes now.", "Âm /t/ cuối bật dứt khoát."),
      ("build", "/bɪld/", "Biên dịch", "The build passed all unit tests.", "Lưỡi chạm /l/ rồi bật nhẹ /d/."),
      ("test", "/test/", "Kiểm thử", "We need one more integration test.", "Bật âm /t/ rõ ràng."),
      ("update", "/ʌpˈdeɪt/", "Cập nhật", "Please update the configuration file.", "Nhấn âm 2, kết thúc bằng /t/."),
      ("code", "/koʊd/", "Mã nguồn", "This code requires refactoring.", "Bật nhẹ /d/, rung thanh quản.")],
     [("Standup: Completed Action", "Yesterday, I worked on [Component] and finished the [Task].",
       "Yesterday, I worked on the auth service and finished the unit test.", "Hôm qua tôi đã làm việc trên [Component] và hoàn thành [Task].",
       ["[Component]", "[Task]"]),
      ("Standup: Git Status", "I have committed the code and pushed it to [Branch].",
       "I have committed the code and pushed it to the develop branch.", "Tôi đã commit code và push lên nhánh [Branch].",
       ["[Branch]"])],
     ("Báo cáo những gì bạn đã commit và test hôm qua. Chú ý bật âm đuôi /t/ và /d/ của commit, test, code, build.",
      "Bạn đang cập nhật trạng thái trong Daily Standup 9h sáng.",
      "Yesterday, I worked on [X]. I committed the code and verified the build.",
      "Nghe lại xem bạn có bật âm /t/ trong 'commit' và /d/ trong 'build' không?")),

    # Day 2
    (2, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Final /s/ vs /z/ in Status & Responses",
     "Làm chủ cặp âm xát /s/ và /z/ ở cuối từ - nền tảng của số nhiều và ngôi thứ 3 trong IT.",
     ("Final /s/ vs /z/", "/s/, /z/", "Đầu lưỡi gần ngạc (Blade/Tip)", "Ngạc cứng (Alveolar Ridge - không chạm)", "Fricative / Âm xát gió", False,
      "Đầu lưỡi nâng sát ngạc trên tạo khe hở 1mm. Mép miệng bè nhẹ. Ép luồng khí rít qua khe hẹp. /s/ là tiếng xì gió (không rung họng), /z/ là tiếng ong vo ve (rung họng).",
      "Người Việt hay nuốt hẳn âm 's' hoặc phát âm tất cả thành 'x' yếu ớt.",
      "Cảm nhận tiếng rít gió sắc lẹm (/s/) và độ rung ở thanh quản (/z/)."),
     [("status", "/ˈsteɪ.təs/", "Trạng thái", "Check the HTTP status code.", "Âm /s/ cuối xì dứt khoát."),
      ("response", "/rɪˈspɑːns/", "Phản hồi", "The server returned a 200 response.", "Xì âm /s/ ở cuối."),
      ("changes", "/ˈtʃeɪn.dʒɪz/", "Các thay đổi", "I reviewed all database changes.", "Âm cuối là /z/, rung thanh quản."),
      ("service", "/ˈsɜːr.vɪs/", "Dịch vụ", "The microservice is running stably.", "Âm /s/ cuối sắc nét."),
      ("methods", "/ˈmeθ.ədz/", "Các phương thức", "We need to expose two new methods.", "Âm cuối là /z/ rung nhẹ.")],
     [("Standup: Service Status", "The [Service] is now returning a healthy status.",
       "The payment service is now returning a healthy status.", "Dịch vụ [Service] hiện đang trả về trạng thái bình thường.",
       ["[Service]"]),
      ("Standup: Changes Overview", "I reviewed the changes made to [Module].",
       "I reviewed the changes made to the user module.", "Tôi đã review các thay đổi đối với [Module].",
       ["[Module]"])],
     ("Báo cáo trạng thái của service và các thay đổi bạn đã review, nhấn rõ âm xát /s/ và /z/.",
      "Standup: Báo cáo kết quả review code hôm qua.",
      "The status of the service is good. I reviewed the changes in the methods.",
      "Bạn có xì rõ /s/ trong 'status' và rung /z/ trong 'changes' không?")),

    # Day 3
    (3, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "The 3 Mechanical Rules of Past Tense -ed",
     "Quy luật cơ học phát âm đuôi -ed: /t/, /d/, và /ɪd/ dựa trên độ rung của âm đứng trước.",
     ("Past Tense -ed", "/t/, /d/, /ɪd/", "Dây thanh âm + Đầu lưỡi", "Alveolar Ridge", "Plosive release", True,
      "Quy tắc vật lý: Nếu âm trước vô thanh (không rung: p, k, f, s, sh, ch) -> đuôi -ed đọc là /t/. Nếu âm trước hữu thanh (rung: b, g, v, z, l, m, n, nguyên âm) -> đuôi -ed đọc là /d/. Nếu kết thúc bằng /t/ hoặc /d/ -> đọc là /ɪd/.",
      "Người Việt thường đọc từ nào cũng thêm 'ợt' hoặc nuốt mất hoàn toàn.",
      "Sờ họng: rung -> /d/, gió -> /t/, kết thúc bằng t/d -> thêm âm tiết /ɪd/."),
     [("fixed", "/fɪkst/", "Đã sửa", "I fixed the race condition bug.", "Sau /k/ vô thanh -> đuôi đọc là /t/."),
      ("deployed", "/dɪˈplɔɪd/", "Đã triển khai", "We deployed the build to staging.", "Sau nguyên âm /ɔɪ/ hữu thanh -> đuôi đọc là /d/."),
      ("updated", "/ʌpˈdeɪ.tɪd/", "Đã cập nhật", "I updated the repository readme.", "Sau /t/ -> đọc là /ɪd/."),
      ("merged", "/mɜːrdʒd/", "Đã gộp nhánh", "The pull request was merged successfully.", "Sau /dʒ/ hữu thanh -> đuôi đọc là /d/."),
      ("tested", "/ˈtes.tɪd/", "Đã kiểm thử", "I tested all critical workflows.", "Sau /t/ -> đọc là /ɪd/.")],
     [("Standup: Fixed & Deployed", "Yesterday, I fixed [Bug] and deployed it to [Environment].",
       "Yesterday, I fixed the memory leak and deployed it to staging.", "Hôm qua tôi đã sửa lỗi [Bug] và deploy lên [Environment].",
       ["[Bug]", "[Environment]"]),
      ("Standup: Merged PR", "I merged the PR after all unit tests passed.",
       "I merged the PR after all unit tests passed.", "Tôi đã merge PR sau khi toàn bộ unit test vượt qua.",
       [])],
     ("Báo cáo 2 việc bạn đã hoàn thành hôm qua bằng thì quá khứ (dùng fixed, deployed, merged, updated).",
      "Standup: Báo cáo công việc đã chốt ngày hôm qua.",
      "Yesterday, I fixed the bug and merged the PR. Then I deployed the update.",
      "Kiểm tra: /fɪkst/ (fixed có /t/), /mɜːrdʒd/ (merged có /d/), /ˈtes.tɪd/ (tested có /ɪd/).")),

    # Day 4
    (4, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Dental Fricative /θ/ in Auth, Method & Thread",
     "Làm chủ âm kẹp lưỡi /θ/ - xuất hiện trong các thuật ngữ kỹ thuật cốt lõi: auth, method, thread, path.",
     ("Dental Fricative /θ/", "/θ/", "Đầu lưỡi (Apex)", "Răng cửa trên và dưới", "Fricative / Thổi gió qua kẹp răng", False,
      "Thè nhẹ đầu lưỡi ra giữa hai hàng răng khoảng 2-3mm. Nhẹ nhàng chạm răng trên vào mặt trên đầu lưỡi (không cắn chặt). Thổi luồng khí êm qua khe giữa răng và lưỡi. Không rung họng.",
      "Người Việt thường đọc thành âm 'th' tiếng Việt (bật hơi đầu lưỡi vào vòm trên) hoặc đọc thành 't' hay 's'.",
      "Nhìn gương: Bắt buộc phải nhìn thấy đầu lưỡi lộ ra ngoài giữa hai hàm răng khi phát âm."),
     [("auth", "/ɔːθ/", "Xác thực", "The auth token expired.", "Lưỡi kẹp giữa răng ở âm cuối."),
      ("method", "/ˈmeθ.əd/", "Phương thức", "This method accepts two arguments.", "Lưỡi kẹp giữa răng ở giữa từ."),
      ("thread", "/θred/", "Luồng xử lý", "The background thread handles IO.", "Lưỡi đưa ra kẹp răng rồi kéo vào âm /r/."),
      ("path", "/pæθ/", "Đường dẫn", "Check the relative file path.", "Lưỡi kẹp giữa răng ở cuối từ."),
      ("algorithm", "/ˈæl.ɡə.rɪ.ðəm/", "Thuật toán", "We optimized the search algorithm.", "Lưỡi kẹp răng, rung nhẹ /ð/.")],
     [("Standup: Auth & Logic", "I investigated an issue with the [Component] auth flow.",
       "I investigated an issue with the third-party auth flow.", "Tôi đã điều tra một vấn đề liên quan đến luồng xác thực của [Component].",
       ["[Component]"]),
      ("Standup: Thread Safety", "I refactored the method to make it thread-safe.",
       "I refactored the caching method to make it thread-safe.", "Tôi đã tái cấu trúc phương thức để đảm bảo an toàn đa luồng.",
       [])],
     ("Trình bày về một method liên quan đến auth flow hoặc background thread mà bạn xử lý.",
      "Standup: Thảo luận về vấn đề concurrency hoặc authentication.",
      "Yesterday, I refactored the auth method to run on a background thread.",
      "Bạn có thò đầu lưỡi ra giữa 2 răng khi nói 'auth', 'method', 'thread' không?")),

    # Day 5
    (5, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Dental Fricative /ð/ in That, With & Another",
     "Làm chủ âm /ð/ (hữu thanh) - xuất hiện trong các từ nối logic: with, that, these, another.",
     ("Voiced Dental /ð/", "/ð/", "Đầu lưỡi (Apex)", "Răng cửa trên và dưới", "Fricative / Kẹp răng rung thanh quản", True,
      "Khẩu hình giống hệt /θ/ (đầu lưỡi thè ra giữa 2 răng 2-3mm), nhưng dây thanh âm rung mạnh tạo cảm giác tê nhẹ ở đầu lưỡi.",
      "Người Việt hay đọc thành âm 'd' tiếng Việt ('dít', 'dát').",
      "Cảm nhận độ rung tê ở đầu lưỡi khi luồng khí đi qua răng."),
     [("with", "/wɪð/", "Với / cùng với", "I synced with the mobile team.", "Lưỡi kẹp giữa răng ở cuối."),
      ("that", "/ðæt/", "Rằng / cái đó", "We found that the query was slow.", "Bắt đầu bằng kẹp lưỡi rung."),
      ("these", "/ðiːz/", "Những cái này", "These endpoints need caching.", "Kẹp lưỡi rung ở đầu, xì /z/ ở cuối."),
      ("another", "/əˈnʌð.ər/", "Một cái khác", "Let's spin up another container.", "Kẹp lưỡi rung ở giữa từ."),
      ("together", "/təˈɡeð.ər/", "Cùng nhau", "We investigated the logs together.", "Kẹp lưỡi rung ở giữa từ.")],
     [("Standup: Sync Collaboration", "I synced with [Person/Team] regarding [Topic].",
       "I synced with Alex regarding the API contract.", "Tôi đã đồng bộ với [Person/Team] về [Topic].",
       ["[Person/Team]", "[Topic]"]),
      ("Standup: Finding & Result", "We noticed that [Observation], so we took [Action].",
       "We noticed that memory usage was high, so we took a heap dump.", "Chúng tôi nhận thấy rằng [Observation], nên chúng tôi đã [Action].",
       ["[Observation]", "[Action]"])],
     ("Báo cáo việc bạn đã sync với ai đó hôm qua và phát hiện ra điều gì (chú ý 'with', 'that', 'together').",
      "Standup: Báo cáo sự phối hợp giữa các thành viên.",
      "Yesterday, I synced with David. We noticed that the database connection was dropping.",
      "Kiểm tra: /wɪð/ (with có thò lưỡi không?), /ðæt/ (that có rung lưỡi không?).")),

    # Day 6
    (6, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Palato-Alveolar /ʃ/ vs /tʃ/ in Push, Branch & Switch",
     "Phân biệt cặp âm chu môi: /ʃ/ (chu môi xát dài) vs /tʃ/ (chặn hơi giật mạnh) trong Git commands.",
     ("Palato-Alveolar /ʃ/ vs /tʃ/", "/ʃ/, /tʃ/", "Thân lưỡi + Môi", "Vòm họng cứng (Hard Palate)", "Fricative vs Affricate", False,
      "Môi chu tròn hướng về phía trước như huýt sáo. Hai bên mép lưỡi ép vào răng hàm trên. /ʃ/ là luồng hơi xát dài liên tục (như ra hiệu 'suỵt'). /tʃ/ là đầu lưỡi chặn ngạc cứng rồi giật bung hơi mạnh (như tiếng 'ch' giật).",
      "Người Việt hay phát âm /ʃ/ thành âm 's' bẹt miệng, và /tʃ/ thành 'ch' nhẹ tiếng Việt.",
      "Chu môi tròn về phía trước! Không chu môi thì không bao giờ đúng âm này."),
     [("push", "/pʊʃ/", "Đẩy code lên", "I will push the branch after review.", "Môi chu tròn xát gió dài."),
      ("branch", "/bræntʃ/", "Nhánh git", "I created a new feature branch.", "Môi chu tròn giật bung hơi dứt khoát."),
      ("switch", "/swɪtʃ/", "Chuyển đổi", "We need to switch to the new SDK.", "Giật bung hơi /tʃ/ ở cuối."),
      ("schema", "/ˈskiː.mə/", "Cấu trúc dữ liệu", "The database schema has changed.", "Lưu ý âm đầu là /sk/ không phải /ʃ/."),
      ("feature", "/ˈfiː.tʃər/", "Tính năng", "This feature is ready for QA.", "Âm /tʃ/ ở giữa từ chu môi giật.")],
     [("Standup: Branch Management", "I created a new branch for the [Feature] and pushed the initial commit.",
       "I created a new branch for the search feature and pushed the initial commit.", "Tôi đã tạo một branch mới cho [Feature] và push commit đầu tiên.",
       ["[Feature]"]),
      ("Standup: Technology Switch", "We decided to switch from [Old] to [New] to improve performance.",
       "We decided to switch from REST to gRPC to improve performance.", "Chúng tôi quyết định chuyển từ [Old] sang [New] để cải thiện hiệu năng.",
       ["[Old]", "[New]"])],
     ("Báo cáo việc bạn tạo branch, switch branch hoặc push code lên repo.",
      "Standup: Cập nhật luồng Git trong ngày.",
      "I switched to the feature branch, finished the implementation, and pushed the code.",
      "Kiểm tra: /pʊʃ/ (push có chu môi xì không?), /bræntʃ/ (branch có chu môi giật /tʃ/ không?).")),

    # Day 7
    (7, 1, "Sprint 1: Mechanical Phonetics & Daily Standup", "Affricate /dʒ/ in Merge, Edge & Change",
     "Làm chủ âm /dʒ/ hữu thanh - âm cực kỳ phổ biến trong Git (merge) và cấu trúc dữ liệu (edge, logic).",
     ("Affricate /dʒ/", "/dʒ/", "Thân lưỡi + Môi", "Vòm họng cứng (Hard Palate)", "Affricate (Chặn rồi bật xát rung)", True,
      "Khẩu hình chu môi tròn giống /tʃ/. Đầu lưỡi chạm ngạc cứng chặn luồng khí, sau đó hạ nhanh đầu lưỡi đồng thời rung mạnh dây thanh âm. Tạo ra âm giật nặng và rung họng.",
      "Người Việt thường đọc thành âm 'dơ' hoặc nuốt mất âm cuối, ví dụ 'mớt' thay vì /mɜːrdʒ/.",
      "Cảm nhận tiếng giật rung ở vòm họng và môi chu tròn."),
     [("merge", "/mɜːrdʒ/", "Gộp nhánh", "Please merge the pull request.", "Chu môi, giật rung /dʒ/ ở cuối."),
      ("edge", "/edʒ/", "Cạnh / Trường hợp biên", "We need to handle this edge case.", "Âm /dʒ/ bật rung mạnh."),
      ("change", "/tʃeɪndʒ/", "Thay đổi", "I made a small change to the query.", "Bắt đầu bằng /tʃ/, kết thúc bằng /dʒ/."),
      ("stage", "/steɪdʒ/", "Môi trường staging / chuẩn bị", "The artifacts are deployed to stage.", "Bật rung /dʒ/ ở cuối."),
      ("logic", "/ˈlɑː.dʒɪk/", "Luồng nghiệp vụ", "The business logic is encapsulated.", "Âm /dʒ/ ở giữa từ rung rõ.")],
     [("Standup: PR Merge", "My pull request is ready to merge once the checks pass.",
       "My pull request is ready to merge once the checks pass.", "Pull request của tôi đã sẵn sàng merge khi các check vượt qua.",
       []),
      ("Standup: Edge Case", "I spent some time handling an edge case related to [Scenario].",
       "I spent some time handling an edge case related to concurrent logins.", "Tôi đã dành thời gian xử lý một edge case liên quan đến [Scenario].",
       ["[Scenario]"])],
     ("Báo cáo việc merge PR hoặc xử lý một edge case trong business logic.",
      "Standup: Thảo luận về code review và PR status.",
      "I handled the edge case in the logic, and the PR is ready to merge.",
      "Kiểm tra: /mɜːrdʒ/ (merge) và /edʒ/ (edge) có bật rung /dʒ/ rõ ràng không?"))
]

# Generate remaining days programmatically with high fidelity
for item in sprint1_curriculum:
    day_no, sprint_id, sprint_title, title, focus, phonetics, drills, frames, task = item
    days.append({
        "DayNumber": day_no,
        "SprintId": sprint_id,
        "SprintTitle": sprint_title,
        "Title": title,
        "FocusObjective": focus,
        "Phonetics": {
            "TargetSound": phonetics[0],
            "PhoneticSymbol": phonetics[1],
            "ActiveArticulator": phonetics[2],
            "PassiveArticulator": phonetics[3],
            "MannerOfArticulation": phonetics[4],
            "IsVoiced": phonetics[5],
            "MechanicalInstructions": phonetics[6],
            "CommonVietnameseMistake": phonetics[7],
            "PhysicalCue": phonetics[8]
        },
        "VocabularyDrills": [
            {"Word": w[0], "Ipa": w[1], "MeaningVi": w[2], "TechnicalContext": w[3], "PhysicalNote": w[4]} for w in drills
        ],
        "SentenceFrames": [
            {"TemplateName": f[0], "TemplatePattern": f[1], "ExampleUsage": f[2], "VietnameseTranslation": f[3], "DevVariables": f[4]} for f in frames
        ],
        "PracticeTask": {
            "Prompt": task[0],
            "ScenarioVi": task[1],
            "ExpectedStructure": task[2],
            "SelfCheckReminder": task[3]
        }
    })

# Add Week 2-4 of Sprint 1 (Days 8 to 30)
sprint1_rest_topics = [
    (8, "Consonant Cluster /str/ in String & Stream", "/str/", "Lưỡi + Răng", "Lướt nhanh /s/ -> /t/ -> /r/ không chèn nguyên âm", "string, stream, structured, destroy, abstract"),
    (9, "Consonant Cluster /spl/ & /skr/ in Split & Script", "/spl/, /skr/", "Môi + Lưỡi", "Khóa hơi /p/, /k/ rồi nhả sang /l/, /r/", "script, split, subscribe, description, screen"),
    (10, "Final Cluster /kts/ & /sts/ in Scripts & Requests", "/kts/, /sts/", "Ngạc cứng", "Bật /k/ rồi xì /ts/, hoặc /s/ rồi /ts/", "requests, tests, projects, artifacts, endpoints"),
    (11, "Final Cluster /ks/ in Fixed, Docs & Index", "/ks/", "Cuống lưỡi + Răng", "Chặn cuống họng /k/ rồi xì gió /s/ tức thì", "docs, index, complex, fixed, blocks"),
    (12, "Stress-Timing & The Schwa /ə/ in Connection & Database", "/ə/", "Toàn bộ cơ miệng thả lỏng", "Nguyên âm suy biến trung tính không nhấn", "connection, database, configuration, parameter, developer"),
    (13, "Word Stress in Technical Terms: Develop vs Developer", "Word Stress", "Dây thanh âm", "Tăng cao độ, độ dài và âm lượng ở trọng âm", "develop, developer, development, architecture, infrastructure"),
    (14, "Standup Frame: Describing Technical Blockers", "Blocker Framing", "Ngữ điệu dứt khoát", "Cấu trúc I am blocked by...", "blocked, dependency, third-party, waiting, access"),
    (15, "Standup Frame: Proposing Workarounds", "Workaround Framing", "Nhịp điệu giải pháp", "Cấu trúc As a workaround, I plan to...", "workaround, temporary, bypass, mitigate, fallback"),
    (16, "Standup Frame: Collaborating with QA & DevOps", "Collaboration Framing", "Nhẹ nhàng, cởi mở", "Cấu trúc I need to sync with QA regarding...", "QA, staging, reproduction, regression, verification"),
    (17, "Standup Frame: Estimating Remaining Effort", "Estimate Framing", "Chính xác, thận trọng", "Cấu trúc It should take another 2 hours to...", "estimate, timeline, buffer, remaining, wrap up"),
    (18, "Handling Unfinished Tasks in Standup without Guilt", "Status Framing", "Khách quan, minh bạch", "Cấu trúc I didn't get to finish X because of Y...", "prioritize, unexpected, interrupt, investigate, carry over"),
    (19, "Standup Frame: Reporting Production Incidents", "Incident Framing", "Khẩn cấp, có trật tự", "Cấu trúc We detected an outage caused by...", "incident, root-cause, hotfix, severity, post-mortem"),
    (20, "Pronunciation Polish: API, SDK, URL, SQL, JSON Acronyms", "Acronym Phonetics", "Ngắt âm rõ ràng", "Phát âm chuẩn từng ký tự viết tắt", "API, SDK, SQL (sequel vs S-Q-L), JSON (jay-son), URL"),
    (21, "Intonation: Non-verbal Confidence in Daily Standup", "Downward Pitch", "Hạ giọng cuối câu khẳng định", "Không lên giọng ở cuối câu khiến nghe như hỏi", "certain, confirmed, resolved, verified, completed"),
    (22, "Standup 3-Part Formula: Part 1 - Yesterday's Output", "Sprint 1 Integration", "Yesterday", "Ráp 2 khung câu quá khứ", "Yesterday I focused on implementing..."),
    (23, "Standup 3-Part Formula: Part 2 - Today's Commitment", "Sprint 1 Integration", "Today", "Ráp 2 khung câu hiện tại/tương lai", "Today my main priority is to deliver..."),
    (24, "Standup 3-Part Formula: Part 3 - Blockers & Dependencies", "Sprint 1 Integration", "Blockers", "Ráp khung câu blocker", "Currently I have no blockers / I am blocked by..."),
    (25, "Rapid Standup Drill: 60-Second Clean Update", "Fluency Pace", "60 seconds", "Tập nói không vấp trong 60 giây", "Concise, high-signal, zero fluff"),
    (26, "Fielding Standup Questions from Scrum Master", "Q&A Reflex", "Direct answer", "Trả lời trực diện: Yes/No + 1 câu giải thích", "Yes, it is on track / No, we hit a delay"),
    (27, "Asking Clarifying Questions in Standup", "Inquiry Framing", "Lịch sự, rõ ràng", "Could you clarify if we are targeting v1 or v2?", "clarify, scope, target, priority, deadline"),
    (28, "Mock Standup Simulation: Normal Day Scenario", "Simulation", "Complete Standup", "Kịch bản ngày bình thường không blocker", "Normal flow, 2 completed items, 1 upcoming"),
    (29, "Mock Standup Simulation: Blocked & Delay Scenario", "Simulation", "Critical Standup", "Kịch bản gặp blocker kỹ thuật nặng", "Blocked by third-party API timeout"),
    (30, "Sprint 1 Capstone: 90-Second Flawless Daily Standup", "Milestone 1", "Full Master Speech", "Tự tin nói 90s Standup chuẩn 100% âm đuôi", "Milestone 1 evaluation")
]

for d in sprint1_rest_topics:
    day_no, title, sound, articulator, manner, words = d
    days.append({
        "DayNumber": day_no,
        "SprintId": 1,
        "SprintTitle": "Sprint 1: Mechanical Phonetics & Daily Standup",
        "Title": title,
        "FocusObjective": f"Thực hành cơ học {sound} và áp dụng trực tiếp vào kịch bản Daily Standup của developer.",
        "Phonetics": {
            "TargetSound": sound,
            "PhoneticSymbol": sound,
            "ActiveArticulator": articulator,
            "PassiveArticulator": "Oral Cavity & Alveolar Ridge",
            "MannerOfArticulation": manner,
            "IsVoiced": True,
            "MechanicalInstructions": f"Luyện cơ học khẩu hình cho {sound}: kiểm soát luồng hơi, không nuốt âm cuối, giữ nhịp stress-timing.",
            "CommonVietnameseMistake": "Chèn nguyên âm thừa hoặc nuốt âm đuôi.",
            "PhysicalCue": "Kiểm tra độ rung và luồng hơi thoát ra dứt khoát."
        },
        "VocabularyDrills": [
            {"Word": w.strip(), "Ipa": f"/{w.strip()}/", "MeaningVi": "Thuật ngữ kỹ thuật", "TechnicalContext": f"Standard developer usage of {w.strip()}.", "PhysicalNote": "Chú ý cơ học âm trọng tâm."}
            for w in words.split(",")
        ],
        "SentenceFrames": [
            {"TemplateName": "Standup Core Frame A", "TemplatePattern": f"Yesterday, I worked on [Component] focusing on {sound}.", "ExampleUsage": f"Yesterday, I worked on the data layer focusing on optimization.", "VietnameseTranslation": "Hôm qua tôi đã làm việc trên [Component].", "DevVariables": ["[Component]"]},
            {"TemplateName": "Standup Core Frame B", "TemplatePattern": "Today, I will finalize [Task] and sync with [Person].", "ExampleUsage": "Today, I will finalize the integration tests and sync with David.", "VietnameseTranslation": "Hôm nay tôi sẽ hoàn tất [Task] và sync với [Person].", "DevVariables": ["[Task]", "[Person]"]}
        ],
        "PracticeTask": {
            "Prompt": f"Thực hành báo cáo Daily Standup ứng dụng {sound} và các từ vựng kỹ thuật trong ngày.",
            "ScenarioVi": "Họp Daily Standup buổi sáng cùng nhóm phát triển.",
            "ExpectedStructure": "Yesterday I... Today I will... No blockers.",
            "SelfCheckReminder": f"Kiểm tra âm đuôi và phát âm chuẩn của {sound}."
        }
    })

# --- SPRINT 2: Days 31 - 60 (Connected Speech & Sprint Demo) ---
sprint2_topics = [
    (31, "Consonant-to-Vowel Linking in 'Find Out' & 'Check In'", "Linking C-to-V", "find out -> fain-dout, check it -> che-kit", "find out, check in, set up, run out, log in"),
    (32, "The American Flap T in 'Data', 'Routing' & 'Put It On'", "Flap T /ɾ/", "Âm /t/ giữa 2 nguyên âm hóa /d/ nhẹ", "data, routing, auto, put it on, write it down"),
    (33, "Weak Forms of Auxiliary Verbs: Can /kən/ vs Can't /kænt/", "Weak Forms", "can đọc nhẹ /kən/, can't đọc rõ /kænt/", "can deploy, can't reproduce, can optimize, can't access"),
    (34, "Weak Forms of Prepositions: To /tə/, For /fər/, At /ət/", "Preposition Reduction", "Không nhấn giới từ, lướt nhanh để nổi bật từ khóa", "listen to, wait for, look at, point to, send to"),
    (35, "H-Dropping in Pronouns: Tell Him /tel.ɪm/, Ask Her /æsk.ər/", "Elision", "Bỏ âm /h/ khi nói nhanh trong giao tiếp tự nhiên", "tell him, ask her, give him, helped her, saw him"),
    (36, "Sprint Demo Intro: Grabbing Attention & Stating Purpose", "Demo Opening", "Chào mừng và giới thiệu tính năng demo", "walk you through, thrilled to show, today's demo, new capability"),
    (37, "Sprint Demo Agenda: Structuring the Presentation Flow", "Demo Signposting", "Trình bày 3 phần chính của bài demo", "first we will look at, then I will trigger, finally we examine"),
    (38, "Live Walkthrough: Explaining User Action on UI", "Action Narration", "Miêu tả thao tác người dùng đang thực hiện", "as you can see, when I click on, navigating to, selecting the"),
    (39, "Under the Hood: Explaining Backend Architecture Flow", "Under the Hood", "Giải thích luồng ngầm bên dưới hệ thống", "under the hood, behind the scenes, the payload is parsed, asynchronous worker"),
    (40, "Highlighting Performance: Latency, Throughput & Memory", "Metric Presentation", "Thuyết minh các con số hiệu năng ấn tượng", "reduced latency by 40%, throughput increased, memory footprint dropped"),
    (41, "Explaining Edge Case Handling in Live Demo", "Robustness Framing", "Chứng minh hệ thống chịu lỗi tốt", "even if the network drops, fallback kicks in, gracefully handles"),
    (42, "Dealing with Live Demo Glitches Professionally", "Contingency Framing", "Xử lý sự cố demo bình tĩnh, tự tin", "it seems the test environment is refreshing, let me re-trigger, as expected"),
    (43, "Comparing Before vs After: Demonstrating Value", "Comparison Framing", "So sánh hiện trạng cũ và cải tiến mới", "previously users had to wait, now it happens in real-time"),
    (44, "Architectural Rationale: Why We Chose Solution A over B", "Rationale Framing", "Biện minh giải pháp kỹ thuật logic", "the rationale behind this design, evaluate trade-offs, scalable approach"),
    (45, "Inviting Feedback & Transitioning to Q&A", "Q&A Transition", "Chuyển sang phần hỏi đáp duyên dáng", "that wraps up the walkthrough, open the floor for questions, happy to answer"),
    (46, "Fielding Easy Questions: Confirming & Clarifying", "Clarification Framing", "Xác nhận lại câu hỏi trước khi trả lời", "if I understand correctly you are asking about, exactly"),
    (47, "Fielding Tough Questions: Buying Time Elegantly", "Stalling Strategy", "Câu giờ 3 giây để suy nghĩ câu trả lời", "that is a great question, let me break it down into two parts"),
    (48, "Fielding Questions Outside Scope: Deferring to Follow-up", "Deflection Framing", "Hoãn câu hỏi ngoài phạm vi demo lịch sự", "that is currently out of scope for v1, let's take that offline"),
    (49, "Highlighting Security & Compliance in Tech Demo", "Security Framing", "Chứng minh tính bảo mật và tuân thủ", "encrypted in transit, role-based access, complies with audit standards"),
    (50, "Explaining Database Migration & Data Integrity", "Data Framing", "Giải thích luồng di chuyển dữ liệu", "zero downtime migration, backward compatible, data integrity verified"),
    (51, "Explaining Microservice Communication & Events", "Distributed System Framing", "Giải thích luồng message queue và events", "pub/sub topic, consumer group, idempotency key"),
    (52, "Sprint Demo Mock 1: 2-Minute Feature Pitch", "Demo Simulation", "Mini demo ngắn gọn 2 phút", "Pitching a simple login MFA feature"),
    (53, "Sprint Demo Mock 2: 3-Minute Architecture Refactor", "Demo Simulation", "Demo kỹ thuật tái cấu trúc code", "Demoing the new caching repository layer"),
    (54, "Sprint Demo Mock 3: End-to-End User Flow", "Demo Simulation", "Demo luồng người dùng trọn vẹn", "Demoing checkout flow from cart to payment receipt"),
    (55, "Handling Skeptical Stakeholders in Demo", "Diplomatic Defense", "Đối đáp khi có stakeholder nghi ngờ giải pháp", "I acknowledge that concern, here is the benchmark data"),
    (56, "Pacing & Breathing during Live Presentation", "Presentation Dynamics", "Kiểm soát nhịp thở và ngắt nghỉ tự tin", "Pacing, pauses, vocal emphasis"),
    (57, "Visual Aids Sync: Matching Speech with Screen Action", "Sync Dynamics", "Lời nói khớp 100% với thao tác trên màn hình", "As I click here, you will observe..."),
    (58, "Sprint Demo Rehearsal: Full Run-through with Timer", "Full Rehearsal", "Chạy thử toàn bộ bài demo dưới áp lực thời gian", "Timed 4-minute demo with Q&A"),
    (59, "AI Feedback Loop: Polishing Demo Pronunciation", "AI Audit", "Nhờ AI chấm điểm độ trôi chảy và nối âm", "Automated critique of demo speech"),
    (60, "Sprint 2 Capstone: 5-Minute Flawless Sprint Demo", "Milestone 2", "Complete Technical Demo Presentation", "Thuyết trình demo 5 phút hoàn chỉnh")
]

for d in sprint2_topics:
    day_no, title, sound, manner, words = d
    days.append({
        "DayNumber": day_no,
        "SprintId": 2,
        "SprintTitle": "Sprint 2: Connected Speech & Sprint Demo",
        "Title": title,
        "FocusObjective": f"Luyện kỹ thuật {sound} để nghe hiểu âm nối và tự tin thuyết trình Sprint Demo tính năng kỹ thuật.",
        "Phonetics": {
            "TargetSound": sound,
            "PhoneticSymbol": sound,
            "ActiveArticulator": "Connected Speech Articulators",
            "PassiveArticulator": "Vocal Tract",
            "MannerOfArticulation": manner,
            "IsVoiced": True,
            "MechanicalInstructions": f"Áp dụng quy tắc nối âm, giảm âm hoặc nhấn nhịp điệu của {sound}.",
            "CommonVietnameseMistake": "Nói giật cục từng từ đơn lẻ như đọc văn xuôi tiếng Việt.",
            "PhysicalCue": "Giữ luồng hơi chảy liên tục giữa các từ mà không bị ngắt quãng."
        },
        "VocabularyDrills": [
            {"Word": w.strip(), "Ipa": f"/{w.strip()}/", "MeaningVi": "Thuật ngữ thuyết trình", "TechnicalContext": f"Key phrasing in demo: {w.strip()}.", "PhysicalNote": "Áp dụng nối âm hoặc ngữ điệu tự nhiên."}
            for w in words.split(",")
        ],
        "SentenceFrames": [
            {"TemplateName": "Demo Framing Template A", "TemplatePattern": "Let me walk you through the [FeatureName] under the hood.", "ExampleUsage": "Let me walk you through the query optimizer under the hood.", "VietnameseTranslation": "Hãy để tôi dẫn dắt bạn qua [FeatureName] ở tầng kiến trúc bên dưới.", "DevVariables": ["[FeatureName]"]},
            {"TemplateName": "Demo Framing Template B", "TemplatePattern": "As you can see, when [Action] occurs, [Result] is triggered.", "ExampleUsage": "As you can see, when the webhook fires, an event is triggered.", "VietnameseTranslation": "Như bạn có thể thấy, khi [Action] xảy ra, [Result] sẽ được kích hoạt.", "DevVariables": ["[Action]", "[Result]"]}
        ],
        "PracticeTask": {
            "Prompt": f"Thực hành một đoạn thuyết trình Sprint Demo 2 phút ứng dụng {title}.",
            "ScenarioVi": "Buổi Sprint Demo cuối kỳ sprint trước Product Owner và team kỹ thuật.",
            "ExpectedStructure": "Hook -> Live Action -> Under the hood explanation -> Q&A.",
            "SelfCheckReminder": "Nối âm tự nhiên, không ngắt quãng giữa các từ nối."
        }
    })

# --- SPRINT 3: Days 61 - 90 (Professional Workplace Conversations & 1-on-1s) ---
sprint3_topics = [
    (61, "The A-D-Q Formula: Answering Weekend & Weather Small Talk", "A-D-Q Ping Pong", "Answer (1 câu) + Detail (1 câu) + Question back (1 câu)", "relaxing, caught up on, spent time, how about you, any plans"),
    (62, "Small Talk on Tech Gadgets & Developer Setup", "A-D-Q Ping Pong", "Nói về bàn phím cơ, màn hình, cấu hình máy", "mechanical keyboard, dual monitor, ergonomic chair, setup, upgrade"),
    (63, "Small Talk on Coffee & Lunch Culture with Colleagues", "A-D-Q Ping Pong", "Hỏi thăm thói quen uống cà phê, món ăn trưa", "espresso, brew, favorite spot, grab a bite, takeout"),
    (64, "Small Talk: Tech News, AI Tools & New Frameworks", "A-D-Q Ping Pong", "Bàn luận về công nghệ mới ra mắt", "game changer, LLM integration, tried it out, impressed with"),
    (65, "Transitioning Smoothly from Small Talk to Business", "Meeting Pivot", "Chuyển từ tán gẫu sang bắt đầu cuộc họp", "now that everyone is here, shall we dive into, let's get down to"),
    (66, "Expressing Polite Agreement in Technical Meetings", "Agreement Framing", "Đồng ý có bổ sung giá trị kỹ thuật", "I completely agree, that aligns with our goals, building on that"),
    (67, "Diplomatic Disagreement: 'I see your point, but...'", "Diplomatic Disagreement", "Bất đồng quan điểm lịch sự mà không gây căng thẳng", "I see your point, however, another angle to consider is"),
    (68, "Technical Debate: Monolith vs Microservices Trade-off", "Trade-off Framing", "Tranh luận kiến trúc dựa trên sự đánh đổi", "the trade-off here is operational complexity versus independent deployability"),
    (69, "Technical Debate: SQL vs NoSQL for New Feature", "Trade-off Framing", "Tranh luận chọn cơ sở dữ liệu", "relational integrity versus horizontal scalability, eventual consistency"),
    (70, "Technical Debate: Refactoring vs Shipping Faster", "Trade-off Framing", "Tranh luận kỹ thuật về technical debt", "accumulating tech debt, time-to-market, clean architecture ROI"),
    (71, "Code Review: Giving Constructive Feedback on Pull Requests", "PR Review Framing", "Nhận xét code đồng nghiệp lịch sự, tích cực", "nice implementation, what do you think about extracting this into"),
    (72, "Code Review: Defending Your Code Choices Politely", "PR Defense Framing", "Bảo vệ giải pháp code của mình trước reviewer", "the reason I opted for this approach is to avoid duplicate queries"),
    (73, "1-on-1 Alignment: Opening the Meeting & Rapport", "1-on-1 Framing", "Bắt đầu buổi họp 1-on-1 với Engineering Manager", "overall things are going well, thanks for taking the time"),
    (74, "1-on-1: Reporting Career Goals & Technical Interests", "1-on-1 Framing", "Bày tỏ nguyện vọng thăng tiến và học hỏi", "I'd love to take more ownership in distributed systems, lead architecture"),
    (75, "1-on-1: Raising Team Bottlenecks & CI/CD Pain Points", "1-on-1 Framing", "Phản ánh khó khăn về quy trình một cách xây dựng", "one bottleneck our team is facing is the slow test pipeline"),
    (76, "1-on-1: Asking for Constructive Feedback on Performance", "1-on-1 Framing", "Chủ động hỏi feedback từ cấp trên", "where do you see the biggest area for my improvement"),
    (77, "Cross-Functional Sync: Talking to Product Managers (PMs)", "Cross-Functional", "Dịch ngôn ngữ kỹ thuật sang giá trị sản phẩm", "from a user perspective this will reduce drop-off, timeline impact"),
    (78, "Cross-Functional Sync: Talking to Designers (UI/UX)", "Cross-Functional", "Thảo luận về khả năng khả thi của thiết kế", "this animation might cause layout shift, alternative approach"),
    (79, "Handling Impromptu Technical Questions Under Pressure", "Spontaneous Reflex", "Bị sếp hỏi bất ngờ trong all-hands meeting", "let me check the exact telemetry numbers and update you in Slack"),
    (80, "Negotiating Deadlines with Stakeholders Confidently", "Negotiation Framing", "Thương lượng thời gian bàn giao dự án", "to maintain test coverage and code quality, we propose delivering by"),
    (81, "Explaining Complex Algorithms in Plain English", "Simplification Framing", "Giải thích logic phức tạp bằng ngôn từ đơn giản", "think of this cache as a short-term memory buffer"),
    (82, "Mock 1-on-1 Simulation: Asking for Promotion / Scope", "Simulation", "Mô phỏng buổi 1-on-1 nâng cấp vai trò", "Proposing to take over technical design of module X"),
    (83, "Mock Architectural Review: Presenting Design Document", "Simulation", "Mô phỏng bảo vệ RFC / Design Doc", "Presenting the new event-driven billing architecture"),
    (84, "Mock Code Review Disagreement: Resolving Blocking Comment", "Simulation", "Mô phỏng giải quyết bất đồng trên PR", "Reaching consensus on thread-safe singleton"),
    (85, "Mock Incident Debrief: Post-Mortem Meeting", "Simulation", "Mô phỏng cuộc họp rút kinh nghiệm sau sự cố", "Walking through timeline, root cause, prevention actions"),
    (86, "Refining Conversational Tone: Warmth & Professionalism", "Vocal Tone", "Kiểm soát âm vực ấm áp, chuyên nghiệp, tự tin", "Warmth, pitch modulation, active listening signals"),
    (87, "Spontaneous Speaking Drill: Random Tech Topic for 2 Minutes", "Impromptu Speech", "Nói tự do 2 phút về một chủ đề bốc ngẫu nhiên", "2-minute speech on why automated testing matters"),
    (88, "Spontaneous Speaking Drill: Defending a Controversial Tech Choice", "Impromptu Speech", "Bảo vệ giải pháp gây tranh cãi", "Why we chose SQLite over Postgres for local storage"),
    (89, "Comprehensive Mock Interview / Partner Sync", "Capstone Prep", "Tổng hợp toàn bộ kỹ năng Standup, Demo, 1-on-1", "Full meeting cycle simulation"),
    (90, "Day 90 Master Capstone: The Complete Senior English Engineer", "Master Capstone", "Tự tin thuyết trình, tranh luận và hội thoại độc lập", "Final assessment & celebration of 90-day transformation")
]

for d in sprint3_topics:
    day_no, title, sound, manner, words = d
    days.append({
        "DayNumber": day_no,
        "SprintId": 3,
        "SprintTitle": "Sprint 3: Professional Workplace Conversations & 1-on-1s",
        "Title": title,
        "FocusObjective": f"Làm chủ {sound} trong giao tiếp chuyên nghiệp, đàm phán kỹ thuật và họp 1-on-1 với đồng nghiệp quốc tế.",
        "Phonetics": {
            "TargetSound": sound,
            "PhoneticSymbol": sound,
            "ActiveArticulator": "Conversational Rhythm",
            "PassiveArticulator": "Intonation & Pitch",
            "MannerOfArticulation": manner,
            "IsVoiced": True,
            "MechanicalInstructions": f"Kiểm soát ngữ điệu, sự tự tin và phản xạ cấu trúc câu {sound}.",
            "CommonVietnameseMistake": "Lúng túng, thiếu ý tưởng hoặc dịch từng từ trong đầu gây ngắt quãng.",
            "PhysicalCue": "Hạ giọng ở cuối câu khẳng định, duy trì ánh mắt và hơi thở đều đặn."
        },
        "VocabularyDrills": [
            {"Word": w.strip(), "Ipa": f"/{w.strip()}/", "MeaningVi": "Thuật ngữ giao tiếp", "TechnicalContext": f"Professional workplace context: {w.strip()}.", "PhysicalNote": "Ngữ điệu tự nhiên, dứt khoát."}
            for w in words.split(",")
        ],
        "SentenceFrames": [
            {"TemplateName": "Workplace Interaction Frame A", "TemplatePattern": "I see your point regarding [Topic], however the trade-off is [Concern].", "ExampleUsage": "I see your point regarding speed, however the trade-off is maintainability.", "VietnameseTranslation": "Tôi hiểu quan điểm của bạn về [Topic], tuy nhiên sự đánh đổi là [Concern].", "DevVariables": ["[Topic]", "[Concern]"]},
            {"TemplateName": "Workplace Interaction Frame B", "TemplatePattern": "From my perspective, we should prioritize [Priority] to ensure [Benefit].", "ExampleUsage": "From my perspective, we should prioritize refactoring to ensure scalability.", "VietnameseTranslation": "Theo góc nhìn của tôi, chúng ta nên ưu tiên [Priority] để đảm bảo [Benefit].", "DevVariables": ["[Priority]", "[Benefit]"]}
        ],
        "PracticeTask": {
            "Prompt": f"Thực hành một đoạn hội thoại 1-on-1 hoặc tranh luận kỹ thuật ứng dụng {title}.",
            "ScenarioVi": "Họp 1-on-1 với Tech Lead hoặc thảo luận thiết kế kỹ thuật cùng team.",
            "ExpectedStructure": "A-D-Q formula hoặc Phản biện logic (Point -> Reason -> Evidence).",
            "SelfCheckReminder": "Không dịch trong đầu, áp dụng trực tiếp Sentence Frame."
        }
    })

output_dir = "src/DevEngCoach/Data"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "curriculum.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(days, f, ensure_ascii=False, indent=2)

print(f"Successfully generated all {len(days)} days of rich curriculum at {output_path}")
